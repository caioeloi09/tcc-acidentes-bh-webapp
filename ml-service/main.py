import os
import sqlite3
from contextlib import asynccontextmanager
from typing import Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sklearn.ensemble import RandomForestClassifier

DB_PATH = os.environ.get("DB_PATH", "../backend/data/accidents.db")

WEEKDAY_NAMES = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]


def load_dataframe() -> pd.DataFrame:
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM accidents", conn)
    conn.close()
    return df


def train_severity_model(df: pd.DataFrame):
    features = ["hour", "weekday", "year", "speed_limit", "is_signposted"]
    target = "is_fatal"

    subset = df[features + [target]].dropna()
    X = subset[features].values
    y = subset[target].values

    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(X, y)

    importances = dict(zip(features, clf.feature_importances_.tolist()))
    return clf, importances, features


app_state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    df = load_dataframe()
    clf, importances, features = train_severity_model(df)

    app_state["df"] = df
    app_state["clf"] = clf
    app_state["feature_importances"] = importances
    app_state["features"] = features

    yield

    app_state.clear()


app = FastAPI(title="ML Service – Acidentes BH", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


def filter_df(
    df: pd.DataFrame,
    year: Optional[int],
    district: Optional[str],
    acc_type: Optional[str],
) -> pd.DataFrame:
    if year is not None:
        df = df[df["year"] == year]
    if district is not None:
        df = df[df["district"].str.upper() == district.upper()]
    if acc_type is not None:
        df = df[df["accident_type"].str.upper() == acc_type.upper()]
    return df


@app.get("/health")
def health():
    return {"status": "ok", "rows": len(app_state.get("df", []))}


@app.get("/forecast")
def forecast(
    year: Optional[int] = Query(None),
    district: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    periods: int = Query(3, ge=1, le=12),
):
    df = filter_df(app_state["df"].copy(), year, district, type)

    monthly = (
        df.groupby(["year", "month"])
        .size()
        .reset_index(name="total")
        .sort_values(["year", "month"])
    )

    if len(monthly) < 6:
        return {"historical": [], "forecast": [], "message": "Dados insuficientes para previsão"}

    series = monthly["total"].values.astype(float)

    # Naive Sazonal: previsão de cada mês futuro = média histórica daquele mês
    # Intervalo de confiança = média ± 1 desvio padrão histórico do mesmo mês
    last_year = int(monthly["year"].iloc[-1])
    last_month = int(monthly["month"].iloc[-1])

    pred = []
    lower_ci = []
    upper_ci = []

    for i in range(periods):
        m = last_month + i + 1
        target_month = ((m - 1) % 12) + 1

        same_month = monthly[monthly["month"] == target_month]["total"].values
        if len(same_month) == 0:
            mu = float(series[-1])
            sigma = float(np.std(series))
        else:
            mu = float(np.mean(same_month))
            sigma = float(np.std(same_month)) if len(same_month) > 1 else mu * 0.1

        pred.append(mu)
        lower_ci.append(max(0.0, mu - sigma))
        upper_ci.append(mu + sigma)

    historical = [
        {"year": int(r["year"]), "month": int(r["month"]), "total": int(r["total"])}
        for _, r in monthly.iterrows()
    ]

    forecast_points = []
    for i, val in enumerate(pred):
        m = last_month + i + 1
        y = last_year + (m - 1) // 12
        m = ((m - 1) % 12) + 1
        forecast_points.append({
            "year": y,
            "month": m,
            "total": max(0, round(float(val))),
            "lower": max(0, round(float(lower_ci[i]))),
            "upper": round(float(upper_ci[i])),
        })

    return {"historical": historical, "forecast": forecast_points}


@app.get("/severity")
def severity(
    year: Optional[int] = Query(None),
    district: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
):
    df = filter_df(app_state["df"].copy(), year, district, type)

    clf: RandomForestClassifier = app_state["clf"]
    features: list = app_state["features"]

    subset = df[features].dropna()
    if len(subset) == 0:
        return {"riskByHour": [], "featureImportances": [], "accuracy": None}

    proba = clf.predict_proba(subset.values)
    fatal_idx = list(clf.classes_).index(1) if 1 in clf.classes_ else -1

    if fatal_idx == -1:
        risk_col = np.zeros(len(subset))
    else:
        risk_col = proba[:, fatal_idx]

    subset = subset.copy()
    subset["risk"] = risk_col

    risk_by_hour = (
        subset.groupby("hour")["risk"]
        .mean()
        .reset_index()
        .rename(columns={"risk": "avgRisk"})
    )

    importances = [
        {"feature": feat_name(f), "importance": round(v, 4)}
        for f, v in app_state["feature_importances"].items()
    ]
    importances.sort(key=lambda x: x["importance"], reverse=True)

    total = len(df)
    fatals = int(df["is_fatal"].sum())
    fatal_pct = round(fatals / total * 100, 1) if total > 0 else 0.0

    return {
        "riskByHour": [
            {"hour": int(r["hour"]), "avgRisk": round(float(r["avgRisk"]), 4)}
            for _, r in risk_by_hour.iterrows()
        ],
        "featureImportances": importances,
        "totalAccidents": total,
        "totalFatals": fatals,
        "fatalPct": fatal_pct,
    }


def feat_name(key: str) -> str:
    names = {
        "hour": "Hora do dia",
        "weekday": "Dia da semana",
        "year": "Ano",
        "speed_limit": "Velocidade permitida",
        "is_signposted": "Via sinalizada",
    }
    return names.get(key, key)


@app.get("/heatmap")
def heatmap(
    year: Optional[int] = Query(None),
    district: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
):
    df = filter_df(app_state["df"].copy(), year, district, type)

    grid = (
        df.groupby(["weekday", "hour"])
        .size()
        .reset_index(name="total")
    )

    max_val = int(grid["total"].max()) if len(grid) > 0 else 1

    cells = [
        {
            "weekday": int(r["weekday"]),
            "weekdayName": WEEKDAY_NAMES[int(r["weekday"])],
            "hour": int(r["hour"]),
            "total": int(r["total"]),
            "intensity": round(r["total"] / max_val, 4),
        }
        for _, r in grid.iterrows()
    ]

    return {"cells": cells, "maxTotal": max_val}
