# Cloud Weather App - Deployment Instructions

## Quick Start (Working Locally)

Run the backend server:
```bash
node server.js
```
Open: `http://localhost:3000`

---

## Firebase Deployment (Step-by-Step)

### Step 1: Create Firebase Project (Browser)

1. Go to: **https://console.firebase.google.com/**
2. Click **"Add project"**
3. Project name: `weather-app`
4. Choose a region (e.g., us-central1)
5. Click **"Create project"** and wait

### Step 2: Get Your Project ID

1. After project is created, go to **Project Settings** (gear icon → Project Settings)
2. Copy your **Project ID** (e.g., `weather-app-abc123`)

### Step 3: Deploy to Firebase

```bash
# Go to your project folder
cd "C:\Users\yamin\OneDrive\Desktop\cloud weather app"

# Connect to your Firebase project
firebase use --add

# When prompted, select your project from the list, and set alias as "default"

# Deploy (hosting only - faster for now)
firebase deploy --only hosting
```

Your app will be live at: `https://YOUR_PROJECT_ID.web.app`

---

## Alternative: AWS Amplify (Easier)

1. **Install AWS CLI:**
```bash
npm install -g aws-cli
```

2. **Configure AWS:**
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Choose region (e.g., us-east-1)
```

3. **Install Amplify CLI:**
```bash
npm install -g @aws-amplify/cli
amplify configure
```

4. **Deploy with Amplify:**
```bash
cd "C:\Users\yamin\OneDrive\Desktop\cloud weather app"
amplify init
amplify add hosting
amplify publish
```

Your app will be hosted on AWS Amplify Console.

---

## Verifying Deployment

After deployment, test your live app:
1. ✅ Search for a city (e.g., "Paris")
2. ✅ Click "Use My Location"
3. ✅ Verify 5-day forecast appears

If weather data doesn't load, check browser console (F12) for errors.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Project not found" | Make sure Firebase project exists and Project ID in `.firebaserc` is correct |
| API calls failing | Backend functions may need to be deployed separately |
| 404 on deployed app | Check that all files (index.html, script.js) are in public directory |

---

## Local Development (Recommended First)

Keep using:
```bash
node server.js
```
This is fully functional and doesn't require cloud setup.

---

