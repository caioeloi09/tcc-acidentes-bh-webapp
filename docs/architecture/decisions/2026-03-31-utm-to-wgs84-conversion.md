# ADR-0004: Dependency-free UTM → WGS84 conversion at migration time

**Date:** 2026-03-31

## Status

Accepted

## Stakeholders

- Caio Eloi Campos (Developer)
- Prof. João Guilherme Maia de Menezes (Advisor)

## Context and Problem Description

The BHTrans dataset stores each accident's location as projected UTM coordinates
(`COORDENADA_X`, `COORDENADA_Y`) in **SIRGAS 2000 / UTM zone 23S**. The
interactive map, however, is built with Leaflet and OpenStreetMap tiles, which
require **geographic coordinates (latitude/longitude in WGS84)**.

A conversion from projected UTM to geographic WGS84 is therefore required. The
decision is *how* and *where* to perform it.

## Decision Criteria

- Correctness of the geodetic conversion
- Minimal runtime/build dependencies
- Conversion done once, not on every request
- Reproducibility and transparency of the transformation

## Options Considered

1. **Convert once in the migration script, with a self-contained formula**
2. **Convert in the migration script using a geospatial library** (e.g. `pyproj`)
3. **Store raw UTM and convert on the fly** in the backend or frontend

## Decision Outcome

Chosen option: **convert once during migration, using a self-contained
implementation of the inverse Transverse Mercator formula** (no external geo
dependency).

`scripts/migrate_data.py` contains a `utm_to_latlon()` function that implements
the standard inverse UTM projection on the WGS84/GRS80 ellipsoid (zone 23,
southern hemisphere, false northing 10,000,000 m, scale factor 0.9996). It
filters out invalid/zero coordinates and writes the resulting `latitude` /
`longitude` columns into the SQLite database. Of ~97k accidents, ~88k end up with
valid coordinates.

### Justification

The conversion is a pure, one-time data-preparation step, so it belongs in the
migration pipeline rather than on the hot path of the API or the browser. Doing
it once means the backend simply serves ready-to-plot coordinates and the
frontend stays trivial. A self-contained formula keeps the migration script free
of heavy geospatial dependencies (such as GDAL/`pyproj`), which simplifies the
environment and CI; the only Python requirements remain `pandas`/`numpy`.

### Positive Consequences

- The API and the map consume coordinates directly — no runtime conversion.
- The migration script has no geospatial system dependencies.
- The transformation is explicit and auditable in version control.
- Invalid coordinates are filtered deterministically at migration time.

### Negative Consequences

- The conversion math is hand-maintained rather than delegated to a vetted
  library, so it must be reviewed carefully.
- It is specialised to UTM zone 23S; another region would require parameter
  changes.
- Re-running the conversion requires re-running the full migration.

## Pros and Cons of the Options

### Convert once, self-contained formula

**Pros:** no geo dependencies, one-time cost, fully reproducible.
**Cons:** hand-written geodesy must be reviewed; zone-specific.

### Convert once, with `pyproj`/GDAL

**Pros:** battle-tested conversion; handles many CRSs.
**Cons:** adds a heavy native dependency to the migration environment and CI.

### Convert on the fly (backend/frontend)

**Pros:** keeps raw values in the database.
**Cons:** repeated work on every request/render; pushes geodesy into the API or browser.

## Links

- [ADR-0003 — SQLite as the read-only analytical database](./2026-03-31-sqlite-database.md)
- [Data model and migration pipeline](../../DATA_MODEL.md)
- `scripts/migrate_data.py`
