const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = '9dc298a363b8d9e3872afa77f5632f40';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Helper to fetch from OpenWeatherMap
const fetchAPI = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
};

// API Routes
app.get('/api/weather', async (req, res) => {
    try {
        const { city, lat, lon } = req.query;
        let url;
        
        if (city) {
            url = `${API_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        } else if (lat && lon) {
            url = `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        } else {
            return res.status(400).json({ error: 'Missing city or coordinates' });
        }
        
        console.log('Fetching:', url);
        const result = await fetchAPI(url);
        res.status(result.status).json(result.body);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

app.get('/api/forecast', async (req, res) => {
    try {
        const { city, lat, lon } = req.query;
        let url;
        
        if (city) {
            url = `${API_BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        } else if (lat && lon) {
            url = `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        } else {
            return res.status(400).json({ error: 'Missing city or coordinates' });
        }
        
        console.log('Fetching:', url);
        const result = await fetchAPI(url);
        res.status(result.status).json(result.body);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch forecast data' });
    }
});

// Catch all - serve index.html for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
