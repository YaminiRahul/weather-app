# Cloud Weather App - Deploy to Render + Firebase

## Step 1: Deploy Backend to Render (Free)

### 1. Create Render Account
- Go to: https://render.com
- Sign up with GitHub, Google, or email

### 2. Connect Your GitHub Repository
1. Push your code to GitHub:
```bash
cd "C:\Users\yamin\OneDrive\Desktop\cloud weather app"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/weather-app.git
git push -u origin main
```

2. On Render:
   - Go to Dashboard
   - Click "New +" → "Web Service"
   - Select your GitHub repository
   - Name: `weather-app`
   - Environment: `Node`
   - Build command: `npm install`
   - Start command: `npm start`
   - Click "Create Web Service"

3. Wait for deployment (takes 2-3 minutes)

4. **Copy your Render URL** (looks like: `https://weather-app-xxx.onrender.com`)

### 3. Update Firebase App with Render Backend URL

Edit `script.js` and replace:
```javascript
const BACKEND_API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api'
    : 'https://YOUR_RENDER_URL.onrender.com/api';  // Replace this!
```

## Step 2: Deploy Frontend to Firebase

```bash
firebase deploy --only hosting
```

## Result
- **Frontend**: https://weather-app-276b1.web.app
- **Backend**: https://weather-app-xxx.onrender.com

---

## Testing
1. Go to: https://weather-app-276b1.web.app
2. Search for a city (e.g., "London")
3. Click "Use My Location"
4. Verify 5-day forecast appears

---

## Local Testing (Before Deployment)
```bash
npm install
node server.js
```
Open: http://localhost:3000

---

## Free Tier Notes
- **Render Free Tier**: Free web service (spins down after 15 min inactivity)
- **Firebase Hosting**: Free with generous limits
- **Total Cost**: $0/month

---

