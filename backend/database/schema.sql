-- Embrace Your Journey Database Schema
-- MySQL Database for Menopause Support App

-- Create database
CREATE DATABASE IF NOT EXISTS embrace_your_journey;
USE embrace_your_journey;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    age INT,
    menopause_stage ENUM('premenopausal', 'perimenopausal', 'menopausal', 'postmenopausal', 'not-sure') DEFAULT 'not-sure',
    newsletter_subscription BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
);

-- Symptoms tracking table
CREATE TABLE IF NOT EXISTS symptoms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    mood_rating INT CHECK (mood_rating >= 1 AND mood_rating <= 5),
    sleep_rating INT CHECK (sleep_rating >= 1 AND sleep_rating <= 5),
    weight DECIMAL(5,2),
    weight_unit ENUM('lbs', 'kg') DEFAULT 'lbs',
    cycle_changes JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date),
    INDEX idx_user_id (user_id),
    INDEX idx_date (date)
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency ENUM('daily', 'twice-daily', 'weekly', 'monthly') NOT NULL,
    time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
);

-- Medication logs table
CREATE TABLE IF NOT EXISTS medication_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    medication_id INT NOT NULL,
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_medication_id (medication_id),
    INDEX idx_taken_at (taken_at)
);

-- User goals table
CREATE TABLE IF NOT EXISTS user_goals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    days_tracked INT DEFAULT 0,
    symptoms_logged INT DEFAULT 0,
    medications_taken INT DEFAULT 0,
    goals_achieved INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_goals (user_id)
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
);

-- Email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (first_name, last_name, email, password_hash, age, menopause_stage, email_verified, is_active) 
VALUES ('Admin', 'User', 'admin@embraceyourjourney.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 30, 'not-sure', TRUE, TRUE);

-- Create views for easier data access
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.created_at,
    COALESCE(ug.days_tracked, 0) as days_tracked,
    COALESCE(ug.symptoms_logged, 0) as symptoms_logged,
    COALESCE(ug.medications_taken, 0) as medications_taken,
    COALESCE(ug.goals_achieved, 0) as goals_achieved
FROM users u
LEFT JOIN user_goals ug ON u.id = ug.user_id
WHERE u.is_active = TRUE;

-- Create view for recent symptoms
CREATE OR REPLACE VIEW recent_symptoms AS
SELECT 
    s.*,
    u.first_name,
    u.last_name
FROM symptoms s
JOIN users u ON s.user_id = u.id
WHERE u.is_active = TRUE
ORDER BY s.date DESC, s.created_at DESC;
