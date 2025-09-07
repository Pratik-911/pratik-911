# Embrace Your Journey - Backend API

A secure Node.js backend API with MySQL database for the "Embrace Your Journey" menopause support application.

## 🚀 Features

- **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- **MySQL Database** - Robust data storage with proper relationships
- **User Management** - Registration, login, profile management
- **Session Management** - Secure session handling with expiration
- **Rate Limiting** - Protection against brute force attacks
- **Input Validation** - Comprehensive request validation
- **Security Headers** - Helmet.js for security
- **CORS Support** - Configurable cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone and Setup

```bash
# Install dependencies
npm install

# Run setup script
node setup.js
```

### 2. Database Setup

#### Option A: Automatic Setup
The server will automatically create tables when you start it for the first time.

#### Option B: Manual Setup
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE embrace_your_journey;"

# Import schema
mysql -u root -p embrace_your_journey < database/schema.sql
```

### 3. Environment Configuration

Copy `env.example` to `.env` and configure:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=embrace_your_journey
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Using the Start Script
```bash
./start.sh
```

## 📊 Database Schema

### Tables

- **users** - User accounts and profiles
- **user_sessions** - Active user sessions
- **symptoms** - Daily symptom tracking
- **medications** - User medications
- **medication_logs** - Medication intake logs
- **user_goals** - User progress tracking
- **password_reset_tokens** - Password reset functionality
- **email_verification_tokens** - Email verification

### Default Admin Account
- **Email**: admin@embraceyourjourney.com
- **Password**: admin123

⚠️ **Change the admin password after first login!**

## 🔐 API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "age": 45,
  "password": "securepassword",
  "menopauseStage": "perimenopausal",
  "newsletter": true
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword",
  "rememberMe": false
}
```

#### POST `/api/auth/logout`
Logout and invalidate session.

**Headers:** `Authorization: Bearer <token>`

#### GET `/api/auth/profile`
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

#### PUT `/api/auth/profile`
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "age": 46,
  "menopauseStage": "menopausal",
  "newsletter": true
}
```

#### PUT `/api/auth/change-password`
Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

#### DELETE `/api/auth/account`
Delete user account.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "password": "currentpassword"
}
```

### Health Check

#### GET `/health`
Check API health status.

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Tokens** - Secure token-based authentication
- **Rate Limiting** - Prevents brute force attacks
- **Input Validation** - Express-validator for request validation
- **SQL Injection Protection** - Parameterized queries
- **CORS Configuration** - Configurable cross-origin policies
- **Security Headers** - Helmet.js security middleware
- **Session Management** - Database-stored sessions with expiration

## 🧪 Testing

```bash
# Run tests
npm test

# Test health endpoint
curl http://localhost:3000/health

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "age": 30,
    "password": "testpassword123"
  }'
```

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   └── authController.js    # Authentication logic
├── database/
│   └── schema.sql           # Database schema
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   └── auth.js              # Authentication routes
├── server.js                # Main server file
├── setup.js                 # Setup script
├── package.json             # Dependencies
└── README-Backend.md        # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | localhost |
| `DB_USER` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | embrace_your_journey |
| `DB_PORT` | MySQL port | 3306 |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | 24h |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `CORS_ORIGIN` | CORS origin | http://localhost:3000 |

### Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Auth Endpoints**: 5 attempts per 15 minutes

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL is running
   - Verify credentials in `.env`
   - Ensure database exists

2. **Port Already in Use**
   - Change `PORT` in `.env`
   - Kill existing process: `lsof -ti:3000 | xargs kill`

3. **JWT Secret Missing**
   - Generate a secure secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - Add to `.env` file

4. **CORS Issues**
   - Update `CORS_ORIGIN` in `.env`
   - Check frontend URL matches

### Logs

The server logs all requests and errors to the console. Check the terminal output for debugging information.

## 🔄 Frontend Integration

Update your frontend to use the backend API:

1. **Update API URL** in `auth-script.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api';
   ```

2. **Add Authorization Headers** for protected routes:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   }
   ```

3. **Handle API Responses**:
   ```javascript
   const data = await response.json();
   if (data.success) {
     // Handle success
   } else {
     // Handle error
   }
   ```

## 📈 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure production database
4. Set up SSL/TLS
5. Configure reverse proxy (nginx)

### Security Checklist
- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**Embrace Your Journey Backend** - Secure, scalable, and user-friendly API for menopause support. 💜
