#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
    console.log('🌟 Welcome to Embrace Your Journey Backend Setup! 🌟\n');
    
    try {
        // Check if .env file exists
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            console.log('✅ .env file already exists');
            const overwrite = await question('Do you want to overwrite it? (y/N): ');
            if (overwrite.toLowerCase() !== 'y') {
                console.log('Setup cancelled.');
                rl.close();
                return;
            }
        }

        console.log('\n📋 Please provide the following information:\n');

        // Database configuration
        const dbHost = await question('Database Host (localhost): ') || 'localhost';
        const dbUser = await question('Database User (root): ') || 'root';
        const dbPassword = await question('Database Password: ');
        const dbName = await question('Database Name (embrace_your_journey): ') || 'embrace_your_journey';
        const dbPort = await question('Database Port (3306): ') || '3306';

        // JWT configuration
        const jwtSecret = await question('JWT Secret (press Enter for auto-generated): ') || generateRandomString(64);
        const jwtExpiresIn = await question('JWT Expires In (24h): ') || '24h';

        // Server configuration
        const port = await question('Server Port (3000): ') || '3000';
        const nodeEnv = await question('Node Environment (development): ') || 'development';

        // CORS configuration
        const corsOrigin = await question('CORS Origin (http://localhost:3000): ') || 'http://localhost:3000';

        // Create .env file
        const envContent = `# Database Configuration
DB_HOST=${dbHost}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}
DB_PORT=${dbPort}

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=${jwtExpiresIn}

# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}

# CORS Configuration
CORS_ORIGIN=${corsOrigin}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

        fs.writeFileSync(envPath, envContent);
        console.log('\n✅ .env file created successfully!');

        // Create database setup instructions
        const dbInstructions = `
📊 Database Setup Instructions:

1. Make sure MySQL is installed and running
2. Create the database:
   mysql -u ${dbUser} -p -e "CREATE DATABASE IF NOT EXISTS ${dbName};"

3. Import the schema:
   mysql -u ${dbUser} -p ${dbName} < database/schema.sql

4. Or run the server and it will auto-create the tables:
   npm start

🔐 Default Admin Account:
   Email: admin@embraceyourjourney.com
   Password: admin123

⚠️  Remember to change the admin password after first login!
`;

        console.log(dbInstructions);

        // Create start script
        const startScript = `#!/bin/bash
echo "🚀 Starting Embrace Your Journey Backend..."
echo "📊 Database: ${dbName}@${dbHost}:${dbPort}"
echo "🌍 Server: http://localhost:${port}"
echo "🔐 Auth API: http://localhost:${port}/api/auth"
echo ""
npm start
`;

        fs.writeFileSync('start.sh', startScript);
        fs.chmodSync('start.sh', '755');
        console.log('✅ Start script created (start.sh)');

        console.log('\n🎉 Setup completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Install dependencies: npm install');
        console.log('2. Start the server: npm start');
        console.log('3. Test the API: curl http://localhost:' + port + '/health');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
    } finally {
        rl.close();
    }
}

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

setup();
