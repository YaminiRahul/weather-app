# ☁️ Cloud Weather App

A real-time weather application powered by cloud APIs, providing current weather data and 5-day forecasts for any location worldwide.

**Live Demo:** [Firebase Hosting](https://weather-app-276b1.web.app) | **Backend:** [Render](https://weather-app-wg7l.onrender.com)

---

## 📋 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Deployment](#deployment)
  - [Firebase Hosting (Frontend)](#firebase-hosting-frontend)
  - [AWS Elastic Beanstalk (Backend)](#aws-elastic-beanstalk-backend)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Introduction

**Cloud Weather App** is a lightweight, full-stack web application that delivers real-time weather information and forecasts. It demonstrates best practices for:

- Secure API key management (environment variables)
- Server-side proxy to handle CORS and protect credentials
- Responsive, modern UI with vanilla JavaScript
- Multi-cloud deployment strategy (Firebase + AWS)
- Robust fallback mechanisms for reliability

The app fetches data from **OpenWeatherMap API** and provides:
- **Current weather** for any city or user's geolocation
- **5-day forecast** with temperature, precipitation, and wind speed
- **Real-time updates** with visual indicators for loading and error states
- **Mobile-responsive design** that works on all devices

---

## ✨ Features

✅ **Search by city** — Enter any city name to get weather data  
✅ **Geolocation support** — "Use My Location" button for automatic weather lookup  
✅ **Current weather display** — Temperature, humidity, wind speed, pressure, UV index  
✅ **5-day forecast** — Daily high/low temps, weather conditions, and precipitation  
✅ **Beautiful UI** — Modern gradient design with smooth animations  
✅ **Error handling** — Clear messages for API failures, network issues, or missing data  
✅ **Responsive design** — Works seamlessly on desktop, tablet, and mobile  
✅ **Fallback mechanism** — Multiple CORS proxy chains for reliability when backend is unavailable  

---

## 📁 Project Structure

```
cloud weather app/
├── index.html              # Frontend HTML with embedded styles
├── script.js               # Frontend logic (fetch, UI rendering, fallbacks)
├── style.css               # CSS styles (responsive design)
├── server.js               # Express backend (API proxy)
├── package.json            # Node.js dependencies
├── firebase.json           # Firebase Hosting config
├── .env.example            # Environment variable template
├── Dockerfile              # (Placeholder - remove if not needed)
├── README.md               # This file
├── README-AWS.md           # AWS deployment guide
├── README_DEPLOY.md        # Firebase deployment guide
└── .gitignore              # Git ignore rules
```

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** — Semantic markup
- **CSS3** — Flexbox, Grid, animations, gradients
- **Vanilla JavaScript** — No frameworks (lightweight, fast)
- **FontAwesome Icons** — For visual indicators

### Backend
- **Node.js** — Runtime environment
- **Express.js** — Web framework for API endpoints
- **HTTPS module** — Secure server-to-server requests

### External APIs
- **OpenWeatherMap API** — Real-time weather data

### Deployment Platforms
- **Firebase Hosting** — Frontend static hosting
- **AWS Elastic Beanstalk** — Backend server hosting (Node.js platform)
- **AWS Amplify** — Alternative for quick static hosting
- **Render** — Current backend deployment (free tier)

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or later) — [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** — [Download here](https://git-scm.com/)
- **OpenWeatherMap API Key** — [Get free key](https://openweathermap.org/api)
- **(Optional) AWS Account** — [Sign up](https://aws.amazon.com/)
- **(Optional) Firebase Project** — [Set up here](https://console.firebase.google.com/)

---

## 🚀 Local Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/YaminiRahul/weather-app.git
cd "cloud weather app"
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure environment variables

Create a `.env` file (do NOT commit this):

```bash
cp .env.example .env
```

Edit `.env` and add your OpenWeatherMap API key:

```
OPENWEATHER_API_KEY=your_real_api_key_here
```

### Step 4: Run the server locally

```bash
node server.js
```

Expected output:
```
WARNING: OPENWEATHER_API_KEY is not set. Set it in your environment before deploying.
Server running at http://localhost:3000
```

(The warning is expected if you haven't set the env var; it will still start.)

### Step 5: Open in browser

Navigate to `http://localhost:3000` and test:

- Search for a city (e.g., "London", "Tokyo")
- Click "Use My Location" to get weather for your current coordinates
- Check the browser console (F12) for any errors

---

## 🌐 Deployment

### Firebase Hosting (Frontend)

#### Prerequisites
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project: [Set up here](https://console.firebase.google.com/)

#### Deploy Steps

1. **Login to Firebase:**
   ```bash
   firebase login
   ```

2. **Initialize project (if not done):**
   ```bash
   firebase init
   ```
   - Choose "Hosting"
   - Select your Firebase project
   - Set public directory to `.` (current directory)

3. **Deploy:**
   ```bash
   firebase deploy --only hosting
   ```

4. **View your live app:**
   ```bash
   firebase open hosting:site
   ```

Your app will be available at: `https://<your-project-id>.web.app`

---

### AWS Elastic Beanstalk (Backend)

#### Prerequisites
- AWS Account with access keys configured
- AWS CLI: `aws configure`
- EB CLI: `pip install awsebcli`

#### Deploy Steps

1. **Initialize EB app:**
   ```bash
   eb init -p node.js weather-app --region us-east-1
   ```

2. **Create environment and deploy:**
   ```bash
   eb create weather-app-env
   ```

3. **Set API key in environment:**
   ```bash
   eb setenv OPENWEATHER_API_KEY=your_real_api_key_here
   ```

4. **Deploy:**
   ```bash
   eb deploy
   ```

5. **Get your backend URL:**
   ```bash
   eb status
   ```

   Your backend will be available at: `https://<your-env-name>.eba-xxxxx.us-east-1.elasticbeanstalk.com`

#### Update Frontend to Use Backend

Edit `script.js` and update:

```javascript
const BACKEND_API = 'https://<your-eb-url>/api';
```

Then redeploy frontend to Firebase.

---

## 🔐 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | ✅ Yes | `abc123def456ghi789` |
| `PORT` | Server port (default: 3000) | ❌ No | `3000` |

**Security Best Practices:**
- Never commit `.env` to the repository
- Use `.env.example` as a template for contributors
- For production, use AWS Secrets Manager or EB environment properties
- Rotate API keys regularly

---

## 📡 API Endpoints

### Backend API (Express server)

All endpoints are prefixed with `/api` when accessed through the Express backend.

#### Get Current Weather

**Endpoint:** `GET /api/weather`

**Query Parameters:**
- `city` — City name (e.g., "London")
- OR `lat` & `lon` — Coordinates (e.g., lat=51.5074&lon=-0.1278)

**Example:**
```bash
curl "http://localhost:3000/api/weather?city=London"
```

**Response:**
```json
{
  "coord": {"lon": -0.1278, "lat": 51.5074},
  "weather": [{"id": 500, "main": "Rain", "description": "light rain"}],
  "main": {
    "temp": 12.5,
    "feels_like": 11.8,
    "humidity": 72,
    "pressure": 1013
  },
  "wind": {"speed": 5.2},
  "clouds": {"all": 90}
}
```

#### Get 5-Day Forecast

**Endpoint:** `GET /api/forecast`

**Query Parameters:**
- `city` — City name
- OR `lat` & `lon` — Coordinates

**Example:**
```bash
curl "http://localhost:3000/api/forecast?city=London"
```

**Response:**
```json
{
  "list": [
    {
      "dt": 1234567890,
      "main": {"temp": 12.5, "humidity": 72},
      "weather": [{"main": "Rain", "description": "light rain"}],
      "wind": {"speed": 5.2}
    }
    // ... more forecast entries
  ]
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **"All CORS proxies failed"** | Backend is not running or unreachable. Start `node server.js` locally or verify EB endpoint is correct. |
| **"Server not configured: OPENWEATHER_API_KEY missing"** | Set environment variable: `set OPENWEATHER_API_KEY=your_key` (Windows) or `export OPENWEATHER_API_KEY=your_key` (Mac/Linux). |
| **404 on Firebase URL** | Run `firebase deploy --only hosting` to redeploy. Check that all files are in the repo root. |
| **Weather data not showing** | Open browser DevTools (F12) → Console tab. Look for error messages about failed API calls. |
| **Geolocation not working** | Browser blocked geolocation permission. Check site settings and grant permission to the app. |
| **Slow API responses** | OpenWeatherMap free tier may be rate-limited. Wait a few seconds and retry. |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/your-feature`
3. **Make your changes** and commit: `git commit -m "Add your feature"`
4. **Push to the branch:** `git push origin feature/your-feature`
5. **Open a Pull Request**

---

## 📄 License

This project is open source and available under the **ISC License**. See `LICENSE` file for details.

---

## 📞 Support & Contact

For issues, questions, or suggestions:

- **GitHub Issues:** [Report a bug](https://github.com/YaminiRahul/weather-app/issues)
- **GitHub Discussions:** [Start a discussion](https://github.com/YaminiRahul/weather-app/discussions)

---

## 🙏 Acknowledgments

- **OpenWeatherMap** — Real-time weather data API
- **Firebase** — Static hosting platform
- **AWS** — Cloud infrastructure
- **FontAwesome** — Icons and visual elements

---

## 📊 Project Report Summary

### Introduction
Cloud Weather App demonstrates full-stack web development with cloud deployment, combining a lightweight frontend with a secure backend proxy for API protection and CORS handling.

### Key Technologies
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Deployment:** Firebase Hosting, AWS Elastic Beanstalk
- **External API:** OpenWeatherMap

### Deployment Strategy
- **Frontend:** Firebase Hosting for fast, static content delivery
- **Backend:** AWS Elastic Beanstalk (Node.js platform) with environment variables for security
- **Alternative:** AWS Lambda + API Gateway for serverless, or AWS Amplify for quick deployment

### Key Features
✅ Real-time weather data with 5-day forecasts  
✅ Secure API key management via environment variables  
✅ CORS-proof server-side proxy  
✅ Responsive design for all devices  
✅ Robust fallback mechanisms for reliability  
✅ Easy local development and cloud deployment  

### Future Enhancements
- Add weather alerts and notifications
- Integrate multiple weather APIs for redundancy
- Add weather history and analytics
- Implement caching to reduce API calls
- Add unit preference (Celsius/Fahrenheit, km/h vs mph)

---

**Last Updated:** November 28, 2025  
**Repository:** [GitHub](https://github.com/YaminiRahul/weather-app)  
**Live App:** [Firebase Hosting](https://weather-app-276b1.web.app)
