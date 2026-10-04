import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CloudSun, Thermometer, Droplets, Wind, MapPin, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './App.css';

interface ForecastItem {
  date: string;
  day: string;
  tavg: number;
  tmax: number;
  tmin: number;
  prcp: number;
  humidity: number;
}

export default function App() {
  const [city, setCity] = useState<string>('Lahore');
  const [currentTemp, setCurrentTemp] = useState<number>(36);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [regionInfo, setRegionInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const cities = ['Lahore', 'Islamabad', 'Karachi', 'Peshawar', 'Quetta', 'Gilgit'];

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/predict', {
        city: city,
        days: 7,
        current_tavg: Number(currentTemp)
      });
      setForecast(response.data.forecast);
      setRegionInfo(response.data.region_info);
    } catch (err) {
      console.error("Failed to fetch weather forecast", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [city]);

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-section">
          <CloudSun size={32} color="#38bdf8" />
          <span className="logo-title">WeatherGuard AI</span>
        </div>
      </header>

      <main>
        {/* Controls Bar with Live Temp Override */}
        <div className="controls-bar" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="#38bdf8" />
            <label style={{ fontWeight: 600 }}>City:</label>
            <select 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              className="city-select"
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Thermometer size={20} color="#ef4444" />
            <label style={{ fontWeight: 600 }}>Today's Live Temp (°C):</label>
            <input 
              type="number"
              value={currentTemp}
              onChange={(e) => setCurrentTemp(Number(e.target.value))}
              style={{
                background: '#0f172a',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.5rem 0.8rem',
                borderRadius: '0.5rem',
                width: '80px'
              }}
            />
            <button 
              onClick={fetchForecast}
              style={{
                background: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                padding: '0.55rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <RefreshCw size={16} /> Predict
            </button>
          </div>

          {regionInfo && (
            <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: 'auto' }}>
              Lat: {regionInfo.latitude}° | Lon: {regionInfo.longitude}° | Elev: {regionInfo.elevation}m
            </span>
          )}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem' }}>Computing Lag Model Predictions...</p>
        ) : forecast.length > 0 && (
          <>
            {/* Stat Cards */}
            <div className="grid-stats">
              <div className="stat-card">
                <div className="stat-icon"><Thermometer /></div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Tomorrow's Forecast</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{forecast[0].tavg} °C</div>
                  <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>Max: {forecast[0].tmax}°C | Min: {forecast[0].tmin}°C</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon"><Droplets /></div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Expected Humidity</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{forecast[0].humidity} %</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon"><Wind /></div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Precipitation</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{forecast[0].prcp} mm</div>
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <div className="chart-section">
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>7-Day Temperature Trend (°C)</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none' }} />
                    <Line type="monotone" dataKey="tmax" stroke="#ef4444" name="Max Temp" strokeWidth={2} />
                    <Line type="monotone" dataKey="tavg" stroke="#38bdf8" name="Avg Temp" strokeWidth={3} />
                    <Line type="monotone" dataKey="tmin" stroke="#3b82f6" name="Min Temp" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Forecast Cards */}
            <h3>7-Day Forecast Cards</h3>
            <div className="forecast-grid">
              {forecast.map((item, idx) => (
                <div key={idx} className="forecast-card">
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.day}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{item.date}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8' }}>{item.tavg}°C</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    💧 {item.humidity}% | 🌧️ {item.prcp}mm
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}