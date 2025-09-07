const express = require('express');
const router = express.Router();
const {
    registerValidation,
    loginValidation,
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount
} = require('../controllers/authController');
const { verifyToken, authRateLimit } = require('../middleware/auth');

// Public routes
router.post('/register', authRateLimit, registerValidation, register);
router.post('/login', authRateLimit, loginValidation, login);

// Protected routes
router.use(verifyToken); // All routes below require authentication

router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.delete('/account', deleteAccount);

module.exports = router;
