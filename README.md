# Embrace Your Journey - Supporting Women Through Menopause

## 📱 Android APK Build Instructions

### Prerequisites
- Android Studio (latest version)
- Node.js 16+ and npm
- JDK 11 or higher
- Android SDK with minimum API level 21

### Steps to Build APK

1. **Setup React Native Environment**
   ```bash
   # Install React Native CLI globally
   npm install -g react-native-cli
   
   # Navigate to frontend directory
   cd frontend
   
   # Install dependencies
   npm install
   ```

2. **Create React Native Project Wrapper**
   ```bash
   # Install React Native WebView
   npm install react-native-webview
   
   # Create native Android project
   npx react-native init EmbraceMobileApp
   cd EmbraceMobileApp
   ```

3. **Configure WebView Component**
   Create `App.js` with WebView pointing to your deployed app:
   ```javascript
   import React from 'react';
   import { WebView } from 'react-native-webview';
   
   const App = () => {
     return (
       <WebView 
         source={{ uri: 'https://embrace-journey-frontend.onrender.com' }}
         style={{ flex: 1 }}
       />
     );
   };
   
   export default App;
   ```

4. **Android Studio Configuration**
   - Open Android Studio
   - Select "Open an existing Android Studio project"
   - Navigate to `EmbraceMobileApp/android`
   - Wait for Gradle sync to complete

5. **Build Configuration**
   - Edit `android/app/build.gradle`:
   ```gradle
   android {
       defaultConfig {
           applicationId "com.embraceyourjourney.app"
           minSdkVersion 21
           targetSdkVersion 33
           versionCode 1
           versionName "1.0.10"
       }
       
       signingConfigs {
           release {
               // Add your keystore configuration
           }
       }
       
       buildTypes {
           release {
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
               signingConfig signingConfigs.release
           }
       }
   }
   ```

6. **Generate Signed APK**
   - In Android Studio: Build → Generate Signed Bundle/APK
   - Select APK
   - Create or use existing keystore
   - Select release build variant
   - APK will be generated in `android/app/build/outputs/apk/release/`

7. **Alternative: Command Line Build**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

### App Permissions
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Testing APK
```bash
# Install on connected device
adb install app-release.apk

# Or use Android Studio's Run button
```

---

## 🚀 Project Overview

**Embrace Your Journey** is a comprehensive menopause support application designed to help women track symptoms, manage medications, and navigate their menopause journey with confidence.

### Features
- 📊 Symptom tracking and analytics
- 💊 Medication reminders and management
- 📈 Health reports and insights
- 🍽️ Menopause-friendly recipes
- 🔐 Secure authentication with JWT
- ☁️ Cloud storage with Firebase Firestore

## 🛠️ Tech Stack

### Backend
- Node.js with Express.js
- Firebase Firestore (NoSQL database)
- JWT authentication
- bcrypt for password hashing
- Rate limiting and security headers

### Frontend
- React with Vite
- Modern responsive UI
- Real-time data synchronization
- Progressive Web App capabilities

## 📦 Project Structure

```
supporting-Women/
├── backend/              # Node.js backend API
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Authentication and validation
│   ├── routes/          # API endpoints
│   └── server.js        # Main server file
├── frontend/            # React frontend application
│   ├── src/            # React components and logic
│   ├── public/         # Static assets
│   └── vite.config.js  # Vite configuration
└── render.yaml         # Render deployment configuration
```

## 🚀 Deployment

This application is deployed on Render with:
- **Backend**: Web Service (Node.js)
- **Frontend**: Static Site (React/Vite)
- **Database**: Firebase Firestore

### Deployment URLs
- Frontend: [Your deployed frontend URL]
- Backend API: [Your deployed backend URL]
- Health Check: [Your backend URL]/health

## 🔧 Local Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Firebase project with Firestore enabled

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pratik-911/pratik-911.git
   cd pratik-911
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5174
   - Backend: http://localhost:4000

## 📝 Environment Variables

### Backend
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `JWT_SECRET` - Secret for JWT tokens
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Firebase service account private key
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email

### Frontend
- `VITE_API_URL` - Backend API URL

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Security headers with Helmet.js
- Input validation and sanitization
- Secure session management

## 📄 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Health Check
- `GET /health` - API health status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the deployment guide

## 🏷️ Version

Current Version: **1.0.10**

---

**Embrace Your Journey** - Supporting women through menopause with technology and compassion 💜
