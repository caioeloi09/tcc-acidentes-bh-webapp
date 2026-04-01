#!/usr/bin/env python3
"""
Data migration script: BHTrans consolidated CSV → SQLite (accidents.db)

Reads the consolidated dataset from Parte 1 Final, aggregates to one row
per accident (boletim), converts UTM SIRGAS 2000 Zone 23S coordinates to
WGS84 lat/lon, and writes to the SQLite database consumed by the Spring Boot backend.

Usage:
    python migrate_data.py --input <path/to/dataset_consolidado.csv> --output <path/to/accidents.db>

Defaults:
    --input  ../data/dataset_consolidado.csv   (project root data/ folder)
    --output ../backend/data/accidents.db
"""

import pandas as pd
import numpy as np
import sqlite3
import argparse
import math
import os
from datetime import datetime

# ---------------------------------------------------------------------------
# UTM → WGS84 conversion (SIRGAS 2000 Zone 23S, no external deps)
# BH coordinates: Zone 23S, False Northing = 10,000,000 m (southern hemisphere)
# ---------------------------------------------------------------------------

def utm_to_latlon(easting: float, northing: float, zone: int = 23, northern: bool = False):
    """
    Convert UTM coordinates (SIRGAS 2000 / WGS84, Zone 23S) to lat/lon degrees.
    Returns (latitude, longitude) or (None, None) if input is invalid.
    """
    if easting <= 0 or northing <= 0:
        return None, None

    # WGS84 / GRS80 ellipsoid constants
    a = 6378137.0            # semi-major axis (m)
    f = 1 / 298.257223563   # flattening
    b = a * (1 - f)          # semi-minor axis
    e2 = 1 - (b ** 2) / (a ** 2)  # eccentricity squared
    e_prime2 = e2 / (1 - e2)

    k0 = 0.9996              # scale factor
    E0 = 500000.0            # false easting
    N0 = 0.0 if northern else 10000000.0  # false northing

    lon0 = math.radians((zone - 1) * 6 - 180 + 3)  # central meridian

    M = (northing - N0) / k0
    mu = M / (a * (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256))

    e1 = (1 - math.sqrt(1 - e2)) / (1 + math.sqrt(1 - e2))
    phi1 = (mu
            + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * math.sin(2 * mu)
            + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * math.sin(4 * mu)
            + (151 * e1 ** 3 / 96) * math.sin(6 * mu)
            + (1097 * e1 ** 4 / 512) * math.sin(8 * mu))

    N1 = a / math.sqrt(1 - e2 * math.sin(phi1) ** 2)
    T1 = math.tan(phi1) ** 2
    C1 = e_prime2 * math.cos(phi1) ** 2
    R1 = a * (1 - e2) / (1 - e2 * math.sin(phi1) ** 2) ** 1.5
    D = (easting - E0) / (N1 * k0)

    lat = phi1 - (N1 * math.tan(phi1) / R1) * (
        D ** 2 / 2
        - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * e_prime2) * D ** 4 / 24
        + (61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * e_prime2 - 3 * C1 ** 2) * D ** 6 / 720
    )
    lon = lon0 + (
        D
        - (1 + 2 * T1 + C1) * D ** 3 / 6
        + (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * e_prime2 + 24 * T1 ** 2) * D ** 5 / 120
    ) / math.cos(phi1)

    return math.degrees(lat), math.degrees(lon)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def clean_str(val):
    """Strip whitespace from string values."""
    if isinstance(val, str):
        return val.strip()
    return val


def parse_datetime(val):
    """Parse date string in DD/MM/YYYY HH:MM format."""
    if pd.isna(val):
        return None
    try:
        return datetime.strptime(str(val).strip(), "%d/%m/%Y %H:%M")
    except ValueError:
        return None


# ---------------------------------------------------------------------------
# Main migration
# ---------------------------------------------------------------------------

def migrate(input_path: str, output_path: str):
    print(f"[1/5] Reading dataset from: {input_path}")
    df = pd.read_csv(input_path, low_memory=False)
    print(f"      {len(df):,} rows, {df['boletim'].nunique():,} unique accidents")

    # Clean string columns
    str_cols = df.select_dtypes(include='object').columns
    for col in str_cols:
        df[col] = df[col].apply(clean_str)

    # -----------------------------------------------------------------------
    print("[2/5] Parsing dates and extracting temporal fields...")
    df['_dt'] = df['DATA_HORA_BOLETIM'].apply(parse_datetime)
    df['_year']    = df['_dt'].apply(lambda d: d.year    if d else None)
    df['_month']   = df['_dt'].apply(lambda d: d.month   if d else None)
    df['_hour']    = df['_dt'].apply(lambda d: d.hour    if d else None)
    df['_weekday'] = df['_dt'].apply(lambda d: d.weekday() if d else None)  # 0=Mon

    # -----------------------------------------------------------------------
    print("[3/5] Aggregating to one row per accident (boletim)...")

    # Accident-level columns (take first value per boletim)
    accident_level = df.groupby('boletim').first().reset_index()[[
        'boletim', 'DATA_HORA_BOLETIM', '_dt', '_year', '_month', '_hour', '_weekday',
        'DESC_TIPO_ACIDENTE', 'DESC_REGIONAL', 'DESC_TEMPO', 'PAVIMENTO',
        'LOCAL_SINALIZADO', 'VELOCIDADE_PERMITIDA',
        'INDICADOR_FATALIDADE', 'VALOR_UPS', 'DESCRIÇÃO_UPS',
        'nome_bairro', 'tipo_logradouro', 'nome_logradouro',
        'COORDENADA_X', 'COORDENADA_Y',
    ]]

    # Aggregate counts per accident
    agg = df.groupby('boletim').agg(
        total_people=('Nº_envolvido', 'nunique'),
        total_fatalities=('desc_severidade', lambda s: (s.str.strip() == 'FATAL').sum()),
        total_vehicles=('seq_veic', 'nunique'),
    ).reset_index()

    accidents = accident_level.merge(agg, on='boletim', how='left')

    # -----------------------------------------------------------------------
    print("[4/5] Converting UTM coordinates to lat/lon...")

    def convert_coords(row):
        x, y = row['COORDENADA_X'], row['COORDENADA_Y']
        try:
            x, y = float(x), float(y)
            if x > 100000 and y > 100000:   # filter out 0.0 / invalid values
                return utm_to_latlon(x, y, zone=23, northern=False)
        except (TypeError, ValueError):
            pass
        return None, None

    coords = accidents.apply(convert_coords, axis=1)
    accidents['latitude']  = [c[0] for c in coords]
    accidents['longitude'] = [c[1] for c in coords]

    valid_coords = accidents['latitude'].notna().sum()
    print(f"      {valid_coords:,} / {len(accidents):,} accidents have valid coordinates")

    # -----------------------------------------------------------------------
    print(f"[5/5] Writing to SQLite: {output_path}")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    conn = sqlite3.connect(output_path)

    # Build final accidents table
    final = pd.DataFrame({
        'boletim':           accidents['boletim'],
        'date_time':         accidents['_dt'].apply(lambda d: d.isoformat() if d else None),
        'year':              accidents['_year'].astype('Int64'),
        'month':             accidents['_month'].astype('Int64'),
        'hour':              accidents['_hour'].astype('Int64'),
        'weekday':           accidents['_weekday'].astype('Int64'),
        'accident_type':     accidents['DESC_TIPO_ACIDENTE'],
        'district':          accidents['DESC_REGIONAL'],
        'neighborhood':      accidents['nome_bairro'],
        'street_type':       accidents['tipo_logradouro'],
        'street_name':       accidents['nome_logradouro'],
        'weather':           accidents['DESC_TEMPO'],
        'pavement':          accidents['PAVIMENTO'],
        'is_signposted':     accidents['LOCAL_SINALIZADO'].apply(lambda v: 1 if str(v).strip() == 'SIM' else 0),
        'speed_limit':       pd.to_numeric(accidents['VELOCIDADE_PERMITIDA'], errors='coerce').astype('Int64'),
        'is_fatal':          accidents['INDICADOR_FATALIDADE'].apply(lambda v: 1 if str(v).strip() == 'SIM' else 0),
        'ups_value':         pd.to_numeric(accidents['VALOR_UPS'], errors='coerce'),
        'ups_description':   accidents['DESCRIÇÃO_UPS'],
        'total_people':      accidents['total_people'].astype('Int64'),
        'total_fatalities':  accidents['total_fatalities'].astype('Int64'),
        'total_vehicles':    accidents['total_vehicles'].astype('Int64'),
        'latitude':          accidents['latitude'],
        'longitude':         accidents['longitude'],
    })

    final.to_sql('accidents', conn, if_exists='replace', index=True, index_label='id')

    # Useful indexes for query performance
    conn.execute("CREATE INDEX IF NOT EXISTS idx_accidents_district   ON accidents(district)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_accidents_neighborhood ON accidents(neighborhood)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_accidents_year_month ON accidents(year, month)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_accidents_type       ON accidents(accident_type)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_accidents_coords     ON accidents(latitude, longitude)")
    conn.commit()
    conn.close()

    print(f"\n✅ Migration complete!")
    print(f"   Accidents written : {len(final):,}")
    print(f"   With coordinates  : {valid_coords:,}")
    print(f"   Fatal accidents   : {int(final['is_fatal'].sum()):,}")
    print(f"   Output            : {output_path}")


# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate BHTrans CSV data to SQLite")
    parser.add_argument(
        "--input",
        default=os.path.join(os.path.dirname(__file__),
                             "../data/dataset_consolidado.csv"),
        help="Path to dataset_consolidado.csv"
    )
    parser.add_argument(
        "--output",
        default=os.path.join(os.path.dirname(__file__),
                             "../backend/data/accidents.db"),
        help="Path for the output SQLite database"
    )
    args = parser.parse_args()
    migrate(os.path.abspath(args.input), os.path.abspath(args.output))
