# Render Environment Variables

## Backend Service Environment Variables

Copy these exact values to your Render backend service:

```
NODE_ENV=production
PORT=10000
JWT_SECRET=b27320c49ce02e343544794aa63c2ca5344a622bfd3944db1bfed1cc2ce8b4a91692a8ed063189142708bff0ce51374359b879f4e5d1fe2952246149c053adfb
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FIREBASE_PROJECT_ID=embrace-e6d5a
FIREBASE_PRIVATE_KEY=[Get this from Firebase Console - see FIREBASE-SETUP.md]
FIREBASE_CLIENT_EMAIL=[Get this from Firebase Console - see FIREBASE-SETUP.md]
CORS_ORIGIN=[Will be set to your frontend URL after frontend deployment]
```

## Frontend Service Environment Variables

Copy these to your Render static site:

```
VITE_API_URL=[Will be set to your backend URL after backend deployment]
```

## Next Steps:

1. **Deploy Backend First**: Use the backend environment variables above
2. **Get Backend URL**: Copy the deployed backend URL (e.g., https://embrace-journey-backend.onrender.com)
3. **Deploy Frontend**: Set VITE_API_URL to your backend URL
4. **Update CORS**: Set CORS_ORIGIN in backend to your frontend URL
5. **Setup Firebase**: Follow FIREBASE-SETUP.md to get Firebase credentials
