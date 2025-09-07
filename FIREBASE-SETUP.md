# Firebase Setup Instructions

## Your Firebase Project: embrace-e6d5a

### Step 1: Enable Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com/project/embrace-e6d5a)
2. Click "Firestore Database" in the left sidebar
3. Click "Create database"
4. Choose "Start in test mode" (for now)
5. Select a location (choose closest to your users)

### Step 2: Generate Service Account Key
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract these values for Render environment variables:

```json
{
  "type": "service_account",
  "project_id": "embrace-e6d5a",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@embrace-e6d5a.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### Step 3: Render Environment Variables
Add these to your backend service in Render:

```
FIREBASE_PROJECT_ID=embrace-e6d5a
FIREBASE_PRIVATE_KEY=[Copy the entire private_key value including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----]
FIREBASE_CLIENT_EMAIL=[Copy the client_email value]
```

### Step 4: Security Rules (Optional - for production)
Update Firestore rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User sessions
    match /user_sessions/{sessionId} {
      allow read, write: if request.auth != null;
    }
    
    // Symptoms - users can only access their own
    match /symptoms/{symptomId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Medications - users can only access their own
    match /medications/{medicationId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### Important Notes:
- Keep your service account key secure
- Never commit the private key to Git
- The private key in environment variables should have actual newlines, not \n
- Test the connection after deployment
