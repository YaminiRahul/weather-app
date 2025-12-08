// server.js  (project root: cloud weather app/server.js)

const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// CONFIG
// =====================

// 🔹 Your OpenWeather API key
const API_KEY = '9dc298a363b8d9e3872afa77f5632f40';

const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// 🔹 URL of your Flask ML service
// Make sure app.py is running on this address/port.
const ML_API_URL = 'http://127.0.0.1:5000/predict_rain';


// =====================
// MIDDLEWARE
// =====================

// Parse JSON bodies (needed for /api/ml/rain POST)
app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files (index.html, script.js, style.css, etc.)
app.use(express.static(path.join(__dirname)));


// =====================
// Helper to call OpenWeather
// =====================

function fetchOpenWeather(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              body: JSON.parse(data),
            });
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}


// =====================
// API: current weather
// =====================

app.get('/api/weather', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    let url;

    if (!API_KEY) {
      return res
        .status(500)
        .json({ error: 'Server not configured: OPENWEATHER_API_KEY missing' });
    }

    if (city) {
      url = `${API_BASE_URL}/weather?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`;
    } else if (lat && lon) {
      url = `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    } else {
      return res.status(400).json({ error: 'Missing city or coordinates' });
    }

    console.log('Fetching weather:', url);
    const result = await fetchOpenWeather(url);

    // If OpenWeather returns error status (404, etc.), forward it
    if (result.status !== 200) {
      return res.status(result.status).json(result.body);
    }

    // Just proxy the OpenWeather data
    return res.json(result.body);
  } catch (err) {
    console.error('Server /api/weather error:', err);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});


// =====================
// API: forecast
// =====================

app.get('/api/forecast', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    let url;

    if (!API_KEY) {
      return res
        .status(500)
        .json({ error: 'Server not configured: OPENWEATHER_API_KEY missing' });
    }

    if (city) {
      url = `${API_BASE_URL}/forecast?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`;
    } else if (lat && lon) {
      url = `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    } else {
      return res.status(400).json({ error: 'Missing city or coordinates' });
    }

    console.log('Fetching forecast:', url);
    const result = await fetchOpenWeather(url);

    if (result.status !== 200) {
      return res.status(result.status).json(result.body);
    }

    return res.json(result.body);
  } catch (err) {
    console.error('Server /api/forecast error:', err);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});


// =====================
// API: ML rain prediction proxy
// =====================

// Front-end calls: POST /api/ml/rain  → Node → Flask /predict_rain
app.post('/api/ml/rain', async (req, res) => {
  try {
    console.log('ML request body:', req.body);

    // Node 18+ has global fetch. If not, install node-fetch and require it.
    const mlResp = await fetch(ML_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const text = await mlResp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // If Flask returns non-JSON, still show something
      data = { raw: text };
    }

    console.log('ML response status:', mlResp.status, 'body:', data);
    res.status(mlResp.status).json(data);
  } catch (err) {
    console.error('Server /api/ml/rain error:', err);
    res.status(500).json({ error: 'Failed to call ML prediction service' });
  }
});


// =====================
// SPA fallback
// =====================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
