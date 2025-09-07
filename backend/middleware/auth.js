const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

// Verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if session exists in database
        const sessionQuery = `
            SELECT us.*, u.id, u.email, u.first_name, u.last_name, u.is_active
            FROM user_sessions us
            JOIN users u ON us.user_id = u.id
            WHERE us.token_hash = ? 
            AND us.expires_at > NOW() 
            AND us.is_active = TRUE 
            AND u.is_active = TRUE
        `;
        
        const sessionResult = await executeQuery(sessionQuery, [token]);
        
        if (!sessionResult.success || sessionResult.data.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired session'
            });
        }

        // Add user info to request
        req.user = {
            id: sessionResult.data[0].user_id,
            email: sessionResult.data[0].email,
            firstName: sessionResult.data[0].first_name,
            lastName: sessionResult.data[0].last_name,
            sessionId: sessionResult.data[0].id
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        } else {
            console.error('Auth middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authentication error'
            });
        }
    }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const sessionQuery = `
            SELECT us.*, u.id, u.email, u.first_name, u.last_name, u.is_active
            FROM user_sessions us
            JOIN users u ON us.user_id = u.id
            WHERE us.token_hash = ? 
            AND us.expires_at > NOW() 
            AND us.is_active = TRUE 
            AND u.is_active = TRUE
        `;
        
        const sessionResult = await executeQuery(sessionQuery, [token]);
        
        if (sessionResult.success && sessionResult.data.length > 0) {
            req.user = {
                id: sessionResult.data[0].user_id,
                email: sessionResult.data[0].email,
                firstName: sessionResult.data[0].first_name,
                lastName: sessionResult.data[0].last_name,
                sessionId: sessionResult.data[0].id
            };
        } else {
            req.user = null;
        }

        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

// Check if user is admin
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if user is admin (you can add an admin field to users table)
        const adminQuery = 'SELECT is_admin FROM users WHERE id = ?';
        const adminResult = await executeQuery(adminQuery, [req.user.id]);
        
        if (!adminResult.success || !adminResult.data[0]?.is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        next();
    } catch (error) {
        console.error('Admin check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authorization error'
        });
    }
};

// Rate limiting for auth endpoints
const authRateLimit = (req, res, next) => {
    // This would typically use a rate limiting library
    // For now, we'll implement basic rate limiting
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Simple in-memory rate limiting (in production, use Redis)
    if (!global.authAttempts) {
        global.authAttempts = new Map();
    }
    
    const attempts = global.authAttempts.get(clientIP) || { count: 0, resetTime: now + 900000 }; // 15 minutes
    
    if (now > attempts.resetTime) {
        attempts.count = 0;
        attempts.resetTime = now + 900000;
    }
    
    if (attempts.count >= 5) { // Max 5 attempts per 15 minutes
        return res.status(429).json({
            success: false,
            message: 'Too many authentication attempts. Please try again later.'
        });
    }
    
    attempts.count++;
    global.authAttempts.set(clientIP, attempts);
    
    next();
};

module.exports = {
    verifyToken,
    optionalAuth,
    requireAdmin,
    authRateLimit
};
