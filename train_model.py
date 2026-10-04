import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import RandomForestRegressor

def train_and_save_model():
    print("Loading weather dataset...")
    df = pd.read_csv("pakistan_weather_2000_2024.csv")
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values(by=['city', 'date']).reset_index(drop=True)

    # City coordinate lookup dictionary
    city_info = df.groupby('city').agg({
        'latitude': 'first',
        'longitude': 'first',
        'elevation': 'first'
    }).to_dict('index')

    # Engineer Lag Features per City
    lag_cols = []
    for lag in [1, 2, 3, 7]:
        for var in ['tavg', 'prcp', 'humidity']:
            col_name = f'{var}_lag_{lag}'
            df[col_name] = df.groupby('city')[var].shift(lag)
            lag_cols.append(col_name)

    # Remove rows with NaN values resulting from lag computation
    df_clean = df.dropna(subset=['tavg_lag_7']).copy()

    feature_cols = ['year', 'month', 'day', 'dayofweek', 'latitude', 'longitude', 'elevation'] + lag_cols
    target_cols = ['tavg', 'tmax', 'tmin', 'prcp', 'humidity']

    X = df_clean[feature_cols]
    y = df_clean[target_cols]

    print("Training Random Forest Regressor with Lag Features...")
    model = RandomForestRegressor(n_estimators=60, max_depth=15, random_state=42, n_jobs=-1)
    model.fit(X, y)

    # Store latest lag values per city for easy forecasting
    latest_city_lags = {}
    for city in df['city'].unique():
        city_df = df[df['city'] == city].tail(7)
        latest_city_lags[city] = {
            'tavg': city_df['tavg'].tolist(),
            'prcp': city_df['prcp'].tolist(),
            'humidity': city_df['humidity'].tolist()
        }

    artifact = {
        'model': model,
        'feature_cols': feature_cols,
        'city_info': city_info,
        'latest_city_lags': latest_city_lags,
        'cities': list(city_info.keys())
    }

    with open("weather_model.pkl", "wb") as f:
        pickle.dump(artifact, f)

    print("Successfully created weather_model.pkl!")

if __name__ == "__main__":
    train_and_save_model()