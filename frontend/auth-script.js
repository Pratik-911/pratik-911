// Authentication Script for Login and Register Pages

// Global variables
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:4000/api' 
    : 'https://pratik-911.onrender.com/api';
let currentUser = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupEventListeners();
    checkExistingSession();
});

// Initialize authentication
function initializeAuth() {
    // Set up form validation
    setupFormValidation();
    
    // Set up password strength checker
    setupPasswordStrength();
    
    // Set up real-time validation
    setupRealTimeValidation();
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Password confirmation validation
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword) {
        confirmPassword.addEventListener('input', validatePasswordMatch);
    }
}

// Check for existing session
function checkExistingSession() {
    const session = localStorage.getItem('embraceYourJourneySession');
    if (session) {
        const sessionData = JSON.parse(session);
        if (sessionData.expires > Date.now()) {
            // Valid session exists, redirect to app
            redirectToApp();
        } else {
            // Session expired, clear it
            localStorage.removeItem('embraceYourJourneySession');
        }
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe');
    
    // Validate form
    if (!validateLoginForm(email, password)) {
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                rememberMe: !!rememberMe
            })
        });
        let data;
        try {
            data = await response.json();
        } catch (jsonErr) {
            data = {};
        }
        if (response.ok && data.success) {
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('userData', JSON.stringify(data.data.user));
            showSuccessModal('Login successful!');
            setTimeout(() => {
                redirectToApp();
            }, 2000);
        } else {
            showErrorModal((data && data.message) || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showErrorModal('Network error. Please check your connection and try again.');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        age: parseInt(formData.get('age')),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        menopauseStage: formData.get('menopauseStage'),
        agreeTerms: document.getElementById('agreeTerms').checked,
        newsletter: document.getElementById('newsletter').checked
    };
    
    // Validate form
    if (!validateRegisterForm(userData)) {
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                age: userData.age,
                password: userData.password,
                confirmPassword: userData.confirmPassword,
                menopauseStage: userData.menopauseStage,
                newsletter: !!userData.newsletter
            })
        });
        
        let data;
        try {
            data = await response.json();
        } catch (jsonErr) {
            data = {};
        }
        if (response.ok && data.success) {
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('userData', JSON.stringify(data.data.user));
            showSuccessModal('Account created successfully!');
            setTimeout(() => {
                redirectToApp();
            }, 2000);
        } else {
            showErrorModal((data && data.message) || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showErrorModal('Network error. Please check your connection and try again.');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Validate register form
function validateRegisterForm(userData) {
    let isValid = true;
    
    // Clear previous errors
    clearFormErrors();
    
    // First name
    if (!userData.firstName || userData.firstName.length < 2) {
        showFieldError('firstName', 'First name must be at least 2 characters');
        isValid = false;
    }
    
    // Last name
    if (!userData.lastName || userData.lastName.length < 2) {
        showFieldError('lastName', 'Last name must be at least 2 characters');
        isValid = false;
    }
    
    // Email
    if (!userData.email || !isValidEmail(userData.email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Age
    if (!userData.age || userData.age < 18 || userData.age > 100) {
        showFieldError('age', 'Please enter a valid age (18-100)');
        isValid = false;
    }
    
    // Password
    if (!userData.password || userData.password.length < 8) {
        showFieldError('password', 'Password must be at least 8 characters');
        isValid = false;
    }
    
    // Confirm password
    if (userData.password !== userData.confirmPassword) {
        showFieldError('confirmPassword', 'Passwords do not match');
        isValid = false;
    }
    
    // Terms agreement
    if (!userData.agreeTerms) {
        showErrorModal('Please agree to the Terms of Service and Privacy Policy');
        isValid = false;
    }
    
    return isValid;
}

// Authenticate user
function authenticateUser(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    return user;
}

// Register new user
function registerUser(userData) {
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
        return false;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        age: userData.age,
        password: userData.password,
        menopauseStage: userData.menopauseStage,
        newsletter: userData.newsletter,
        createdAt: new Date().toISOString(),
        // Initialize user data
        data: {
            symptoms: [],
            medications: [],
            goals: {
                daysTracked: 0,
                symptomsLogged: 0,
                medicationsTaken: 0,
                goalsAchieved: 0
            }
        }
    };
    
    // Add to users array
    users.push(newUser);
    
    // Save to localStorage
    localStorage.setItem('embraceYourJourneyUsers', JSON.stringify(users));
    
    return true;
}

// Create user session
function createSession(user, rememberMe) {
    const sessionData = {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        expires: rememberMe ? Date.now() + (30 * 24 * 60 * 60 * 1000) : Date.now() + (24 * 60 * 60 * 1000) // 30 days or 1 day
    };
    
    localStorage.setItem('embraceYourJourneySession', JSON.stringify(sessionData));
    currentUser = user;
}

// Setup form validation
function setupFormValidation() {
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// Setup password strength checker
function setupPasswordStrength() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
}

// Setup real-time validation
function setupRealTimeValidation() {
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            if (this.value && !isValidEmail(this.value)) {
                showFieldError('email', 'Please enter a valid email address');
            } else {
                clearFieldError(this);
            }
        });
    }
}

// Check password strength
function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    const strengthContainer = document.getElementById('passwordStrength');
    
    if (!strengthBar || !strengthText || !strengthContainer) return;
    
    strengthContainer.classList.add('show');
    
    let strength = 0;
    let strengthLabel = '';
    
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    strengthBar.className = 'strength-fill';
    
    if (strength <= 2) {
        strengthBar.classList.add('weak');
        strengthLabel = 'Weak';
    } else if (strength <= 3) {
        strengthBar.classList.add('medium');
        strengthLabel = 'Medium';
    } else {
        strengthBar.classList.add('strong');
        strengthLabel = 'Strong';
    }
    
    strengthText.textContent = `Password strength: ${strengthLabel}`;
}

// Validate password match
function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (confirmPassword && password !== confirmPassword) {
        showFieldError('confirmPassword', 'Passwords do not match');
    } else {
        clearFieldError(document.getElementById('confirmPassword'));
    }
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    switch (fieldName) {
        case 'email':
            if (value && !isValidEmail(value)) {
                showFieldError(fieldName, 'Please enter a valid email address');
                return false;
            }
            break;
        case 'password':
            if (value && value.length < 8) {
                showFieldError(fieldName, 'Password must be at least 8 characters');
                return false;
            }
            break;
        case 'age':
            if (value && (isNaN(value) || value < 18 || value > 100)) {
                showFieldError(fieldName, 'Please enter a valid age (18-100)');
                return false;
            }
            break;
    }
    
    clearFieldError(field);
    return true;
}

// Show field error
function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (!field) return;
    
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.add('error');
        
        // Remove existing error message
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
    }
}

// Clear field error
function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error');
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

// Clear all form errors
function clearFormErrors() {
    const errorGroups = document.querySelectorAll('.form-group.error');
    errorGroups.forEach(group => {
        group.classList.remove('error');
        const errorMessage = group.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    });
}

// Toggle password visibility
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const toggle = field.parentElement.querySelector('.password-toggle i');
    
    if (field.type === 'password') {
        field.type = 'text';
        toggle.className = 'fas fa-eye-slash';
    } else {
        field.type = 'password';
        toggle.className = 'fas fa-eye';
    }
}

// Set button loading state
function setButtonLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Show success modal
function showSuccessModal(message) {
    const modal = document.getElementById('success-modal');
    const messageElement = document.getElementById('success-message');
    
    if (messageElement) {
        messageElement.textContent = message;
    }
    
    modal.classList.add('show');
}

// Show error modal
function showErrorModal(message) {
    const modal = document.getElementById('error-modal');
    const messageElement = document.getElementById('error-message');
    
    if (messageElement) {
        messageElement.textContent = message;
    }
    
    modal.classList.add('show');
}

// Close modal
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
    });
}

// Redirect to main app
function redirectToApp() {
    window.location.href = 'index.html';
}

// Sign in with Google (placeholder)
function signInWithGoogle() {
    showErrorModal('Google sign-in is not implemented yet. Please use email and password.');
}

// Sign up with Google (placeholder)
function signUpWithGoogle() {
    showErrorModal('Google sign-up is not implemented yet. Please use email and password.');
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

// Handle escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});
