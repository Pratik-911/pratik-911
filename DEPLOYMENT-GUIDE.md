# Deployment Guide for Embrace Your Journey

## Project: pratik-911

This guide will help you deploy the Embrace Your Journey application to Render using the web interface.

## Prerequisites
- Git repository (GitHub, GitLab, or Bitbucket)
- Render account
- Firebase project with Firestore enabled

## Step 1: Push to Git Repository

First, push this code to a Git repository:

```bash
# Add a remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/embrace-your-journey.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Configure the backend service:

### Backend Configuration:
- **Name**: `embrace-journey-backend`
- **Project**: `pratik-911`
- **Runtime**: `Node`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Instance Type**: `Free`

### Environment Variables:
```
NODE_ENV=production
PORT=10000
JWT_SECRET=[Generate a secure random string - use: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"]
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FIREBASE_PROJECT_ID=embrace-e6d5a
FIREBASE_PRIVATE_KEY=[Get from Firebase Console - Service Account Key]
FIREBASE_CLIENT_EMAIL=[Get from Firebase Console - Service Account Key]
```

## Step 3: Deploy Frontend Service

1. Click "New +" → "Static Site"
2. Connect the same Git repository
3. Configure the frontend service:

### Frontend Configuration:
- **Name**: `embrace-journey-frontend`
- **Project**: `pratik-911`
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`

### Environment Variables:
```
VITE_API_URL=[Your backend service URL from step 2]
```

## Step 4: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing
3. Enable Firestore Database
4. Go to Project Settings → Service Accounts
5. Generate a new private key
6. Copy the credentials to your backend environment variables

## Step 5: Update CORS Settings

After both services are deployed, update the backend's CORS_ORIGIN environment variable:
```
CORS_ORIGIN=[Your frontend service URL]
```

## Step 6: Test Deployment

1. Visit your frontend URL
2. Try registering a new account
3. Test login functionality
4. Verify API endpoints are working

## Troubleshooting

### Common Issues:

1. **Firebase Connection Failed**
   - Verify Firebase credentials are correct
   - Ensure Firestore is enabled
   - Check private key formatting (newlines)

2. **CORS Errors**
   - Update CORS_ORIGIN with correct frontend URL
   - Redeploy backend service

3. **Build Failures**
   - Check build logs in Render dashboard
   - Verify all dependencies are in package.json

## Service URLs

After deployment, your services will be available at:
- Backend: `https://embrace-journey-backend.onrender.com`
- Frontend: `https://embrace-journey-frontend.onrender.com`

## Security Notes

- Never commit Firebase service account keys to Git
- Use strong JWT secrets
- Enable HTTPS only in production
- Regularly rotate API keys
