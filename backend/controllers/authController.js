const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const crypto = require('crypto');

// Validation rules
const registerValidation = [
    body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('age').isInt({ min: 18, max: 100 }).withMessage('Age must be between 18-100'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    body('menopauseStage').optional().isIn(['premenopausal', 'perimenopausal', 'menopausal', 'postmenopausal', 'not-sure'])
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Register new user
const register = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { firstName, lastName, email, age, password, menopauseStage, newsletter } = req.body;

        // Check if user already exists in Firestore
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user in Firestore
        const userRef = await db.collection('users').add({
            firstName,
            lastName,
            email,
            passwordHash,
            age,
            menopauseStage: menopauseStage || 'not-sure',
            newsletter: newsletter || false,
            isActive: true,
            createdAt: new Date(),
            lastLogin: null
        });
        const userId = userRef.id;
        // Initialize user goals in Firestore
        await db.collection('user_goals').doc(userId).set({
            userId,
            daysTracked: 0,
            symptomsLogged: 0,
            medicationsTaken: 0,
            goalsAchieved: 0
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId, email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Store session in Firestore
        await db.collection('user_sessions').add({
            userId,
            token,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            isActive: true
        });
        // Update last login in Firestore
        await db.collection('users').doc(userId).update({ lastLogin: new Date() });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: userId,
                    firstName,
                    lastName,
                    email,
                    age,
                    menopauseStage: menopauseStage || 'not-sure',
                    newsletter: newsletter || false
                },
                token,
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password, rememberMe } = req.body;

        // Find user by email in Firestore
        const loginSnapshot = await db.collection('users').where('email', '==', email).where('isActive', '==', true).get();
        if (loginSnapshot.empty) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        const userDoc = loginSnapshot.docs[0];
        const user = userDoc.data();
        user.id = userDoc.id;

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const expiresIn = rememberMe ? '30d' : '24h';
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        // Store session in Firestore
        const expiresInMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        await db.collection('user_sessions').add({
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + expiresInMs),
            isActive: true
        });
        // Update last login in Firestore
        await db.collection('users').doc(user.id).update({ lastLogin: new Date() });

    // Remove password hash from response
    delete user.passwordHash;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token,
                expiresIn
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

// Logout user
const logout = async (req, res) => {
    try {
        const { sessionId } = req.user;

        // Deactivate session
        const logoutQuery = 'UPDATE user_sessions SET is_active = FALSE WHERE id = ?';
        await executeQuery(logoutQuery, [sessionId]);

        res.json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout'
        });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        // Get user profile from Firestore
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists || !userDoc.data().isActive) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const user = userDoc.data();
        // Get user goals from Firestore
        const goalsDoc = await db.collection('user_goals').doc(userId).get();
        const goals = goalsDoc.exists ? goalsDoc.data() : {};
        res.json({
            success: true,
            data: { user: { ...user, ...goals, id: userId } }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, age, menopauseStage, newsletter } = req.body;

        // Update user profile in Firestore
        await db.collection('users').doc(userId).update({
            firstName,
            lastName,
            age,
            menopauseStage,
            newsletter
        });
        res.json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Validate new password
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters'
            });
        }

        // Get current password hash from Firestore
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists || !userDoc.data().isActive) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userDoc.data().passwordHash);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        // Hash new password
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
        // Update password in Firestore
        await db.collection('users').doc(userId).update({ passwordHash: newPasswordHash });
        // Deactivate all existing sessions in Firestore
        const sessions = await db.collection('user_sessions').where('userId', '==', userId).where('isActive', '==', true).get();
        const batch = db.batch();
        sessions.forEach(doc => batch.update(doc.ref, { isActive: false }));
        await batch.commit();
        res.json({
            success: true,
            message: 'Password changed successfully. Please login again.'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete user account
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        // Get user from Firestore
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists || !userDoc.data().isActive) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, userDoc.data().passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect'
            });
        }
        // Deactivate user account (soft delete) in Firestore
        await db.collection('users').doc(userId).update({ isActive: false });
        // Deactivate all sessions in Firestore
        const sessions = await db.collection('user_sessions').where('userId', '==', userId).where('isActive', '==', true).get();
        const batch = db.batch();
        sessions.forEach(doc => batch.update(doc.ref, { isActive: false }));
        await batch.commit();
        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    registerValidation,
    loginValidation,
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount
};
