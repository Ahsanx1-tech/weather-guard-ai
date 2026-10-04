# WeatherGuard AI: Lag-Based Weather Forecasting Web Application

WeatherGuard AI is a full-stack machine learning web application built with **FastAPI** and **React (TypeScript)**. It utilizes historical meteorological data from Pakistan (2000–2024) and trains a multi-output **Random Forest Regressor** with time-series lag features ($1, 2, 3$, and $7$-day historical windows) to forecast multi-variable weather conditions dynamically.

## 🌟 Key Features

* **Lag Feature Engineering**: Built-in temporal lag models ($t-1, t-2, t-3, t-7$) for average temperature, precipitation, and humidity.

* **Dynamic Live Input Override**: Real-time integration of current weather inputs to re-calibrate predictions dynamically.

* **FastAPI REST API**: High-performance backend providing asynchronous prediction endpoints and OAuth verification.

* **Modern Interactive Dashboard**: Dark-mode UI built using React, Vite, TypeScript, Lucide Icons, and Recharts.

## 🏗️ Project Architecture

```
weather-guard-ai/
├── backend/
│   ├── pakistan_weather_2000_2024.csv  # Dataset
│   ├── train_model.py                  # ML model training script
│   ├── main.py                         # FastAPI backend server
│   └── weather_model.pkl               # Model artifact (generated)
└── frontend/
    ├── src/
    │   ├── App.tsx                     # Main React frontend component
    │   └── App.css                     # Custom styling
    ├── package.json
    └── vite.config.ts

```

## 🚀 Quick Start & Installation

### Prerequisites

* **Python 3.9+**

* **Node.js 18+** & `npm`

### Step 1: Backend Setup (FastAPI)

1. Open terminal and navigate to the `backend/` directory:

   ```
   cd backend
   
   ```

2. Install Python dependencies:

   ```
   pip install fastapi uvicorn scikit-learn pandas numpy google-auth pyjwt
   
   ```

3. Generate the Machine Learning Model Artifact (`weather_model.pkl`):

   ```
   python train_model.py
   
   ```

4. Start the FastAPI server:

   ```
   uvicorn main:app --reload --port 8000
   
   ```

   *Backend running at:* `http://127.0.0.1:8000`

### Step 2: Frontend Setup (React + TypeScript)

1. Open a new terminal tab and navigate to the `frontend/` directory:

   ```
   cd frontend
   
   ```

2. Install Node package dependencies:

   ```
   npm install
   npm install @react-oauth/google lucide-react recharts axios
   
   ```

3. Launch the Vite development server:

   ```
   npm run dev
   
   ```

   *Frontend running at:* `http://localhost:5173`

## 📊 How the Model Works

1. **Feature Engineering**: `train_model.py` derives $1, 2, 3$, and $7$-day temporal lag columns for temperature, humidity, and rainfall per geographic station along with geospatial coordinates (`latitude`, `longitude`, `elevation`).

2. **Sequential Iteration**: For multi-day forecasting ($7$-day forecast), each day's model prediction is fed back iteratively as the $t-1$ lag feature for the next day's prediction step.
