# Firebase & AWS Deployment Guide

## **Firebase Hosting Deployment**

### Prerequisites
1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Install functions dependencies:
```bash
cd functions
npm install
cd ..
```

### Deploy to Firebase

1. **Login to Firebase:**
```bash
firebase login
```

2. **Initialize (if first time):**
```bash
firebase init
```
   - Select: Hosting, Functions
   - Choose your Firebase project
   - Public directory: `.` (current)
   - Configure as SPA: Yes

3. **Deploy:**
```bash
firebase deploy
```

This will deploy:
- Static files (HTML, CSS) to Firebase Hosting
- Backend API functions as Cloud Functions
- Your app will be available at: `https://YOUR_PROJECT.web.app`

---

## **AWS Deployment (Amplify + Lambda)**

### Option 1: AWS Amplify (Recommended - Easiest)

1. **Install AWS Amplify CLI:**
```bash
npm install -g @aws-amplify/cli
```

2. **Configure Amplify:**
```bash
amplify configure
```

3. **Initialize Amplify in your project:**
```bash
amplify init
```
   - Project name: `cloud-weather-app`
   - Environment: `prod`
   - Choose your AWS region
   - Editor: Visual Studio Code

4. **Add Hosting:**
```bash
amplify add hosting
```
   - Select: Amplify Console
   - Publish directory: `.` (current directory)

5. **Add API (Lambda backend):**
```bash
amplify add api
```
   - Select: REST
   - Provide API name: `weather-api`
   - Create a new Lambda function
   - Accept defaults for the rest

6. **Deploy:**
```bash
amplify publish
```

Your app will be available at the Amplify Console URL.

---

### Option 2: AWS Lambda + API Gateway (Manual)

1. **Create Lambda Function:**
   - Go to AWS Console → Lambda
   - Create new function with Node.js 18 runtime
   - Copy code from `functions/index.js`

2. **Create API Gateway:**
   - Create a new REST API
   - Create resources: `/weather`, `/forecast`
   - Create GET methods pointing to Lambda
   - Deploy to a stage

3. **Update script.js:**
```javascript
const API_ENDPOINT = 'https://YOUR_API_GATEWAY_URL.execute-api.REGION.amazonaws.com/prod';
```

4. **Host static files:**
   - Upload `index.html`, `script.js` to S3
   - Enable static website hosting
   - Update CloudFront (optional)

---

## **Local Testing**

Run the local Node server:
```bash
node server.js
```
Open: `http://localhost:3000`

---

## **Environment Variables (Optional)**

For production, store API key as environment variable:

### Firebase:
```bash
firebase functions:config:set openweather.key="YOUR_API_KEY"
```

### AWS Amplify:
```bash
amplify env add
amplify update api
```

---

## **Deployment Status**

After deployment, test:
1. Search for a city (e.g., "London")
2. Click "Use My Location"
3. Verify 5-day forecast loads

If API calls fail, check:
- Browser DevTools Console for errors
- Cloud Function/Lambda logs
- CORS headers in backend
- API key validity

---

