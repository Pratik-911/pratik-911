#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting build process..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production

# Go back to root and install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Build frontend
echo "🏗️ Building frontend..."
npm run build

echo "✅ Build process completed!"
