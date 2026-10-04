import os
import pickle
import datetime
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Weather Guard AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "weather_model.pkl"
if not os.path.exists(MODEL_PATH):
    raise RuntimeError("weather_model.pkl not found! Run 'python train_model.py' first.")

with open(MODEL_PATH, "rb") as f:
    artifact = pickle.load(f)

model = artifact['model']
feature_cols = artifact['feature_cols']
city_info = artifact['city_info']
latest_city_lags = artifact['latest_city_lags']
available_cities = artifact['cities']

class PredictRequest(BaseModel):
    city: str
    days: Optional[int] = 7
    current_tavg: Optional[float] = None
    current_humidity: Optional[float] = None
    current_prcp: Optional[float] = None

@app.get("/")
def read_root():
    return {"message": "Weather Guard AI Backend API is Running", "cities": available_cities}

@app.post("/api/predict")
def predict_weather(req: PredictRequest):
    if req.city not in available_cities:
        raise HTTPException(status_code=400, detail=f"City '{req.city}' not found in dataset.")

    c_info = city_info[req.city]
    lags = latest_city_lags[req.city]

    # Initialize lag history
    tavg_hist = list(lags['tavg'])
    prcp_hist = list(lags['prcp'])
    hum_hist = list(lags['humidity'])

    # Override latest lag value with user input if provided
    if req.current_tavg is not None:
        tavg_hist[-1] = req.current_tavg
    if req.current_humidity is not None:
        hum_hist[-1] = req.current_humidity
    if req.current_prcp is not None:
        prcp_hist[-1] = req.current_prcp

    predictions = []
    base_date = datetime.date.today()

    for i in range(1, req.days + 1):
        target_date = base_date + datetime.timedelta(days=i)
        
        row = {
            'year': target_date.year,
            'month': target_date.month,
            'day': target_date.day,
            'dayofweek': target_date.weekday(),
            'latitude': c_info['latitude'],
            'longitude': c_info['longitude'],
            'elevation': c_info['elevation'],
            'tavg_lag_1': tavg_hist[-1],
            'tavg_lag_2': tavg_hist[-2],
            'tavg_lag_3': tavg_hist[-3],
            'tavg_lag_7': tavg_hist[-7],
            'prcp_lag_1': prcp_hist[-1],
            'prcp_lag_2': prcp_hist[-2],
            'prcp_lag_3': prcp_hist[-3],
            'prcp_lag_7': prcp_hist[-7],
            'humidity_lag_1': hum_hist[-1],
            'humidity_lag_2': hum_hist[-2],
            'humidity_lag_3': hum_hist[-3],
            'humidity_lag_7': hum_hist[-7],
        }

        df_feat = pd.DataFrame([row])[feature_cols]
        pred = model.predict(df_feat)[0]

        tavg, tmax, tmin, prcp, humidity = pred
        tavg = float(round(tavg, 1))
        tmax = float(round(tmax, 1))
        tmin = float(round(tmin, 1))
        prcp = float(round(max(0, prcp), 2))
        humidity = float(round(np.clip(humidity, 0, 100), 1))

        predictions.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "day": target_date.strftime("%a"),
            "tavg": tavg,
            "tmax": tmax,
            "tmin": tmin,
            "prcp": prcp,
            "humidity": humidity
        })

        # Append prediction into lag history for sequential multi-day forecasting
        tavg_hist.append(tavg)
        prcp_hist.append(prcp)
        hum_hist.append(humidity)

    return {
        "city": req.city,
        "region_info": c_info,
        "forecast": predictions
    }