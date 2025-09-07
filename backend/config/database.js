
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin with environment variables for production
if (!admin.apps.length) {
    if (process.env.NODE_ENV === 'production' && process.env.FIREBASE_PRIVATE_KEY) {
        // Use environment variables in production
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            })
        });
    } else {
        // Use service account file in development or fallback
        try {
            const serviceAccount = require('./serviceAccountKey.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } catch (error) {
            console.error('Firebase service account file not found and environment variables not set.');
            console.error('For development: Add serviceAccountKey.json to backend/config/');
            console.error('For production: Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL environment variables.');
            throw error;
        }
    }
}

const db = getFirestore();

// Test connection function
async function testConnection() {
    try {
        // Try to access Firestore
        await db.collection('test').limit(1).get();
        console.log('✅ Firebase connection successful');
        return true;
    } catch (error) {
        console.error('❌ Firebase connection failed:', error.message);
        return false;
    }
}

// Initialize database function
async function initializeDatabase() {
    try {
        console.log('🔄 Initializing Firebase database...');
        
        // Create initial collections if they don't exist
        const collections = ['users', 'symptoms', 'medications', 'user_sessions'];
        
        for (const collectionName of collections) {
            const collectionRef = db.collection(collectionName);
            const snapshot = await collectionRef.limit(1).get();
            
            if (snapshot.empty) {
                console.log(`📝 Creating ${collectionName} collection...`);
                // Create a placeholder document to initialize the collection
                await collectionRef.add({ initialized: true, createdAt: new Date() });
            }
        }
        
        console.log('✅ Database initialization complete');
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        return false;
    }
}

module.exports = { db, testConnection, initializeDatabase };
