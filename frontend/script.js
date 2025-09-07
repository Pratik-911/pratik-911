// Global variables
let currentUser = null;
let currentSection = 'dashboard';
let symptoms = [];
let medications = [];
let recipes = [];
let userData = {
    daysTracked: 0,
    symptomsLogged: 0,
    medicationsTaken: 0,
    goalsAchieved: 0
};

// API Base URL function
function getApiBaseUrl() {
    return window.location.hostname === 'localhost' 
        ? 'http://localhost:4000/api' 
        : 'https://pratik-911.onrender.com/api';
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuthentication()) {
        window.location.href = 'login.html';
        return;
    }
    
    loadUserData();
    initializeApp();
    setupEventListeners();
    loadRecipes();
    updateDashboard();
    setTodayDate();
    updateUserProfile();
});

// Load user data from localStorage
function loadUserData() {
    const savedData = localStorage.getItem('embraceYourJourneyData');
    if (savedData) {
        userData = JSON.parse(savedData);
    }
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('embraceYourJourneyData', JSON.stringify(userData));
}

// Initialize the app
function initializeApp() {
    // Set up navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            showSection(targetSection);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Set up rating buttons
    const ratingButtons = document.querySelectorAll('.rating-btn');
    ratingButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            const rating = this.getAttribute('data-rating');
            
            // Remove selected class from other buttons in same category
            const categoryButtons = document.querySelectorAll(`[data-category="${category}"]`);
            categoryButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            this.classList.add('selected');
        });
    });

    // Set up recipe category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterRecipes(category);
        });
    });
}

// Set up event listeners
function setupEventListeners() {
    // Report period change
    const reportPeriod = document.getElementById('report-period');
    if (reportPeriod) {
        reportPeriod.addEventListener('change', updateReports);
    }
}

// Show specific section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Set today's date in the date input
function setTodayDate() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

// Submit symptoms
function submitSymptoms() {
    const date = document.getElementById('date').value;
    const weight = document.getElementById('weight').value;
    const weightUnit = document.getElementById('weight-unit').value;
    const notes = document.getElementById('notes').value;
    
    // Get selected ratings
    const moodRating = getSelectedRating('mood');
    const sleepRating = getSelectedRating('sleep');
    
    // Get selected cycle changes
    const cycleChanges = getSelectedCycleChanges();
    
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    if (!moodRating || !sleepRating) {
        alert('Please rate your mood and sleep quality');
        return;
    }
    
    const symptomEntry = {
        id: Date.now(),
        date: date,
        mood: moodRating,
        sleep: sleepRating,
        weight: weight ? parseFloat(weight) : null,
        weightUnit: weightUnit,
        cycleChanges: cycleChanges,
        notes: notes,
        timestamp: new Date().toISOString()
    };
    
    // Check if entry for this date already exists
    const existingIndex = userData.symptoms.findIndex(s => s.date === date);
    if (existingIndex !== -1) {
        userData.symptoms[existingIndex] = symptomEntry;
    } else {
        userData.symptoms.push(symptomEntry);
    }
    
    // Update goals
    userData.goals.symptomsLogged++;
    if (existingIndex === -1) {
        userData.goals.daysTracked++;
    }
    
    saveUserData();
    updateDashboard();
    showSuccessModal('Your symptoms have been logged successfully!');
    
    // Check for goal achievements
    checkGoalAchievements();
    
    // Clear form
    clearTrackingForm();
}

// Get selected rating for a category
function getSelectedRating(category) {
    const selectedButton = document.querySelector(`[data-category="${category}"].selected`);
    return selectedButton ? parseInt(selectedButton.getAttribute('data-rating')) : null;
}

// Get selected cycle changes
function getSelectedCycleChanges() {
    const checkboxes = document.querySelectorAll('.cycle-options input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Clear tracking form
function clearTrackingForm() {
    document.getElementById('date').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('notes').value = '';
    
    // Clear selected ratings
    const ratingButtons = document.querySelectorAll('.rating-btn');
    ratingButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Clear checkboxes
    const checkboxes = document.querySelectorAll('.cycle-options input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    
    // Set today's date
    setTodayDate();
}

// Update dashboard
function updateDashboard() {
    document.getElementById('days-tracked').textContent = userData.goals.daysTracked;
    document.getElementById('symptoms-logged').textContent = userData.goals.symptomsLogged;
    document.getElementById('medications-taken').textContent = userData.goals.medicationsTaken;
    document.getElementById('goals-achieved').textContent = userData.goals.goalsAchieved;
    
    updateActivityList();
}

// Update activity list
function updateActivityList() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    if (userData.symptoms.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <i class="fas fa-info-circle"></i>
                <p>Start your journey by logging your first symptoms!</p>
            </div>
        `;
        return;
    }
    
    const recentSymptoms = userData.symptoms.slice(-5).reverse();
    activityList.innerHTML = recentSymptoms.map(symptom => {
        const date = new Date(symptom.date).toLocaleDateString();
        const moodEmoji = getMoodEmoji(symptom.mood);
        return `
            <div class="activity-item">
                <i class="fas fa-calendar-day"></i>
                <p>Logged symptoms for ${date} - Mood: ${moodEmoji} Sleep: ${symptom.sleep}/5</p>
            </div>
        `;
    }).join('');
}

// Get mood emoji
function getMoodEmoji(rating) {
    const emojis = ['😞', '😐', '😊', '😄', '🤩'];
    return emojis[rating - 1] || '😊';
}

// Add medication
function addMedication() {
    const name = document.getElementById('med-name').value;
    const dosage = document.getElementById('med-dosage').value;
    const frequency = document.getElementById('med-frequency').value;
    const time = document.getElementById('med-time').value;
    
    if (!name || !dosage || !time) {
        alert('Please fill in all medication fields');
        return;
    }
    
    const medication = {
        id: Date.now(),
        name: name,
        dosage: dosage,
        frequency: frequency,
        time: time,
        addedDate: new Date().toISOString()
    };
    
    userData.medications.push(medication);
    saveUserData();
    updateMedicationsList();
    updateReminders();
    
    // Clear form
    document.getElementById('med-name').value = '';
    document.getElementById('med-dosage').value = '';
    document.getElementById('med-time').value = '';
    
    showSuccessModal('Medication added successfully!');
}

// Update medications list
function updateMedicationsList() {
    const medicationsList = document.getElementById('medications-list');
    if (!medicationsList) return;
    
    if (userData.medications.length === 0) {
        medicationsList.innerHTML = `
            <h3>Your Medications</h3>
            <div class="no-medications">
                <i class="fas fa-pills"></i>
                <p>No medications added yet. Add your first medication to get started!</p>
            </div>
        `;
        return;
    }
    
    const medicationsHTML = userData.medications.map(med => `
        <div class="medication-item">
            <div class="medication-info">
                <h4>${med.name}</h4>
                <p>${med.dosage} - ${med.frequency} at ${med.time}</p>
            </div>
            <div class="medication-actions">
                <button onclick="takeMedication(${med.id})">Taken</button>
                <button onclick="removeMedication(${med.id})" style="background: #f44336;">Remove</button>
            </div>
        </div>
    `).join('');
    
    medicationsList.innerHTML = `
        <h3>Your Medications</h3>
        ${medicationsHTML}
    `;
}

// Take medication
function takeMedication(medId) {
    userData.goals.medicationsTaken++;
    saveUserData();
    updateDashboard();
    showSuccessModal('Great job taking your medication!');
    checkGoalAchievements();
}

// Remove medication
function removeMedication(medId) {
    if (confirm('Are you sure you want to remove this medication?')) {
        userData.medications = userData.medications.filter(med => med.id !== medId);
        saveUserData();
        updateMedicationsList();
        updateReminders();
    }
}

// Update reminders
function updateReminders() {
    const remindersList = document.getElementById('today-reminders');
    if (!remindersList) return;
    
    const today = new Date().toISOString().split('T')[0];
    const todayReminders = userData.medications.filter(med => {
        // Simple logic - show all daily medications as reminders
        return med.frequency === 'daily' || med.frequency === 'twice-daily';
    });
    
    if (todayReminders.length === 0) {
        remindersList.innerHTML = `
            <div class="no-reminders">
                <i class="fas fa-bell-slash"></i>
                <p>No reminders for today. Add medications to set up reminders!</p>
            </div>
        `;
        return;
    }
    
    const remindersHTML = todayReminders.map(med => `
        <div class="reminder-item">
            <div class="reminder-info">
                <div class="reminder-time">${med.time}</div>
                <div>
                    <strong>${med.name}</strong><br>
                    <small>${med.dosage}</small>
                </div>
            </div>
            <button onclick="takeMedication(${med.id})" style="background: #4CAF50;">Mark Taken</button>
        </div>
    `).join('');
    
    remindersList.innerHTML = remindersHTML;
}

// Load recipes
function loadRecipes() {
    const recipes = [
        {
            id: 1,
            title: "Hormone-Balancing Smoothie",
            description: "Rich in phytoestrogens and omega-3s to support hormonal balance.",
            category: "hormone-balancing",
            icon: "🥤",
            tags: ["Phytoestrogens", "Omega-3", "Antioxidants"]
        },
        {
            id: 2,
            title: "Calcium-Rich Green Smoothie",
            description: "Packed with calcium and vitamin D for strong bones.",
            category: "bone-health",
            icon: "🥬",
            tags: ["Calcium", "Vitamin D", "Magnesium"]
        },
        {
            id: 3,
            title: "Mood-Boosting Oatmeal",
            description: "Complex carbs and tryptophan to support serotonin production.",
            category: "mood-support",
            icon: "🥣",
            tags: ["Tryptophan", "Complex Carbs", "B Vitamins"]
        },
        {
            id: 4,
            title: "Sleep-Inducing Chamomile Tea",
            description: "Natural herbs to promote relaxation and better sleep.",
            category: "sleep-aid",
            icon: "🍵",
            tags: ["Chamomile", "Lavender", "Magnesium"]
        },
        {
            id: 5,
            title: "Soy and Flaxseed Bowl",
            description: "Plant-based estrogens to help balance hormones naturally.",
            category: "hormone-balancing",
            icon: "🥗",
            tags: ["Soy", "Flaxseed", "Phytoestrogens"]
        },
        {
            id: 6,
            title: "Bone-Building Salmon Salad",
            description: "Omega-3s and vitamin D for optimal bone health.",
            category: "bone-health",
            icon: "🐟",
            tags: ["Omega-3", "Vitamin D", "Protein"]
        }
    ];
    
    const recipesGrid = document.getElementById('recipes-grid');
    if (recipesGrid) {
        recipesGrid.innerHTML = recipes.map(recipe => `
            <div class="recipe-card" data-category="${recipe.category}">
                <div class="recipe-image">
                    <span style="font-size: 4rem;">${recipe.icon}</span>
                </div>
                <div class="recipe-content">
                    <h3>${recipe.title}</h3>
                    <p>${recipe.description}</p>
                    <div class="recipe-tags">
                        ${recipe.tags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Filter recipes by category
function filterRecipes(category) {
    const recipeCards = document.querySelectorAll('.recipe-card');
    recipeCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Update reports
function updateReports() {
    const period = document.getElementById('report-period').value;
    const now = new Date();
    let startDate;
    
    switch (period) {
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '3months':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        case 'year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
    }
    
    const filteredSymptoms = userData.symptoms.filter(symptom => 
        new Date(symptom.date) >= startDate
    );
    
    updateCharts(filteredSymptoms);
}

// Update charts (simplified version)
function updateCharts(symptoms) {
    if (symptoms.length === 0) {
        document.getElementById('mood-chart').innerHTML = '<p>No data available for the selected period.</p>';
        document.getElementById('sleep-chart').innerHTML = '<p>No data available for the selected period.</p>';
        document.getElementById('weight-chart').innerHTML = '<p>No data available for the selected period.</p>';
        document.getElementById('symptom-summary').innerHTML = '<p>No data available for the selected period.</p>';
        return;
    }
    
    // Simple chart representation
    const moodData = symptoms.map(s => s.mood);
    const sleepData = symptoms.map(s => s.sleep);
    const weightData = symptoms.filter(s => s.weight).map(s => s.weight);
    
    document.getElementById('mood-chart').innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h4>Average Mood: ${(moodData.reduce((a, b) => a + b, 0) / moodData.length).toFixed(1)}/5</h4>
            <p>Based on ${moodData.length} entries</p>
        </div>
    `;
    
    document.getElementById('sleep-chart').innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h4>Average Sleep: ${(sleepData.reduce((a, b) => a + b, 0) / sleepData.length).toFixed(1)}/5</h4>
            <p>Based on ${sleepData.length} entries</p>
        </div>
    `;
    
    if (weightData.length > 0) {
        document.getElementById('weight-chart').innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h4>Weight Range: ${Math.min(...weightData)} - ${Math.max(...weightData)} lbs</h4>
                <p>Based on ${weightData.length} entries</p>
            </div>
        `;
    } else {
        document.getElementById('weight-chart').innerHTML = '<p>No weight data available.</p>';
    }
    
    // Symptom summary
    const allCycleChanges = symptoms.flatMap(s => s.cycleChanges);
    const symptomCounts = {};
    allCycleChanges.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
    
    const summaryHTML = Object.entries(symptomCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([symptom, count]) => `<div>${symptom.replace('-', ' ')}: ${count} times</div>`)
        .join('');
    
    document.getElementById('symptom-summary').innerHTML = summaryHTML || '<p>No symptom patterns detected.</p>';
}

// Export report for doctor as PDF
function exportReport() {
    if (userData.symptoms.length === 0) {
        alert('No data to export. Please log some symptoms first.');
        return;
    }
    
    generatePDFReport();
}

// Generate PDF report
function generatePDFReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set up PDF styling
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(233, 30, 99); // Pink color
    doc.text('Embrace Your Journey - Health Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Patient Summary
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80); // Dark blue
    doc.text('Patient Summary', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const summary = generateReportSummary();
    doc.text(`Total Days Tracked: ${userData.goals.daysTracked}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Total Symptoms Logged: ${userData.goals.symptomsLogged}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Average Mood Rating: ${summary.averageMood}/5`, 20, yPosition);
    yPosition += 7;
    doc.text(`Average Sleep Rating: ${summary.averageSleep}/5`, 20, yPosition);
    yPosition += 7;
    doc.text(`Date Range: ${summary.dateRange.start} to ${summary.dateRange.end}`, 20, yPosition);
    yPosition += 15;
    
    // Medications
    if (userData.medications.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text('Current Medications', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        userData.medications.forEach(med => {
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(`• ${med.name} - ${med.dosage} (${med.frequency} at ${med.time})`, 20, yPosition);
            yPosition += 7;
        });
        yPosition += 10;
    }
    
    // Symptom Trends
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Symptom Trends', 20, yPosition);
    yPosition += 10;
    
    // Create a simple chart representation
    const recentSymptoms = userData.symptoms.slice(-14); // Last 14 days
    if (recentSymptoms.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        
        // Mood trend
        doc.text('Mood Trend (Last 14 Days):', 20, yPosition);
        yPosition += 7;
        const moodData = recentSymptoms.map(s => s.mood);
        const avgMood = (moodData.reduce((a, b) => a + b, 0) / moodData.length).toFixed(1);
        doc.text(`Average: ${avgMood}/5`, 30, yPosition);
        yPosition += 7;
        
        // Sleep trend
        doc.text('Sleep Quality Trend (Last 14 Days):', 20, yPosition);
        yPosition += 7;
        const sleepData = recentSymptoms.map(s => s.sleep);
        const avgSleep = (sleepData.reduce((a, b) => a + b, 0) / sleepData.length).toFixed(1);
        doc.text(`Average: ${avgSleep}/5`, 30, yPosition);
        yPosition += 10;
    }
    
    // Symptom Patterns
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Symptom Patterns', 20, yPosition);
    yPosition += 10;
    
    const allCycleChanges = userData.symptoms.flatMap(s => s.cycleChanges);
    const symptomCounts = {};
    allCycleChanges.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
    
    if (Object.keys(symptomCounts).length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const sortedSymptoms = Object.entries(symptomCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        sortedSymptoms.forEach(([symptom, count]) => {
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
            }
            const symptomName = symptom.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            doc.text(`• ${symptomName}: ${count} times`, 20, yPosition);
            yPosition += 7;
        });
    } else {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('No specific symptom patterns detected.', 20, yPosition);
    }
    
    yPosition += 15;
    
    // Detailed Symptom Log
    if (userData.symptoms.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text('Detailed Symptom Log', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Table headers
        doc.text('Date', 20, yPosition);
        doc.text('Mood', 60, yPosition);
        doc.text('Sleep', 80, yPosition);
        doc.text('Weight', 100, yPosition);
        doc.text('Symptoms', 130, yPosition);
        yPosition += 7;
        
        // Draw line
        doc.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 5;
        
        // Show last 20 entries
        const recentEntries = userData.symptoms.slice(-20).reverse();
        recentEntries.forEach(entry => {
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
            }
            
            const date = new Date(entry.date).toLocaleDateString();
            const mood = entry.mood || '-';
            const sleep = entry.sleep || '-';
            const weight = entry.weight ? `${entry.weight}${entry.weightUnit}` : '-';
            const symptoms = entry.cycleChanges.length > 0 ? entry.cycleChanges.slice(0, 2).join(', ') : '-';
            
            doc.text(date, 20, yPosition);
            doc.text(mood.toString(), 60, yPosition);
            doc.text(sleep.toString(), 80, yPosition);
            doc.text(weight, 100, yPosition);
            doc.text(symptoms, 130, yPosition);
            yPosition += 6;
        });
    }
    
    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Embrace Your Journey - Menopause Support App', pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
    }
    
    // Save the PDF
    const fileName = `menopause-health-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    showSuccessModal('PDF report generated successfully! You can now share this with your doctor.');
}

// Generate report summary
function generateReportSummary() {
    if (userData.symptoms.length === 0) return {};
    
    const moodData = userData.symptoms.map(s => s.mood);
    const sleepData = userData.symptoms.map(s => s.sleep);
    
    return {
        averageMood: (moodData.reduce((a, b) => a + b, 0) / moodData.length).toFixed(1),
        averageSleep: (sleepData.reduce((a, b) => a + b, 0) / sleepData.length).toFixed(1),
        totalEntries: userData.symptoms.length,
        dateRange: {
            start: userData.symptoms[0].date,
            end: userData.symptoms[userData.symptoms.length - 1].date
        }
    };
}

// Check for goal achievements
function checkGoalAchievements() {
    const achievements = [];
    
    if (userData.goals.daysTracked === 7) {
        achievements.push("7-day tracking streak! 🌟");
    }
    if (userData.goals.daysTracked === 30) {
        achievements.push("30-day tracking milestone! 🎉");
    }
    if (userData.goals.symptomsLogged === 50) {
        achievements.push("50 symptoms logged! 📊");
    }
    if (userData.goals.medicationsTaken === 10) {
        achievements.push("10 medications taken on time! 💊");
    }
    
    if (achievements.length > 0) {
        userData.goals.goalsAchieved += achievements.length;
        saveUserData();
        showCelebrationModal(achievements[0]);
    }
}

// Show success modal
function showSuccessModal(message) {
    const modal = document.getElementById('success-modal');
    const messageElement = document.getElementById('success-message');
    
    messageElement.textContent = message;
    modal.classList.add('show');
    
    setTimeout(() => {
        closeModal();
    }, 3000);
}

// Show celebration modal
function showCelebrationModal(message) {
    const modal = document.getElementById('celebration-modal');
    const messageElement = document.getElementById('celebration-message');
    
    messageElement.textContent = message;
    modal.classList.add('show');
    
    // Add confetti effect
    createConfetti();
    
    setTimeout(() => {
        closeModal();
    }, 5000);
}

// Create confetti effect
function createConfetti() {
    const confettiContainer = document.querySelector('.confetti');
    if (!confettiContainer) return;
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'][Math.floor(Math.random() * 5)];
        confettiContainer.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

// Close modal
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
    });
}

// Authentication Functions
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
        return false;
    }
    
    try {
        // Check if token is expired (basic check)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            return false;
        }
        return true;
    } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        return false;
    }
}

function getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function updateUserProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Update navigation
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = user.firstName;
    }
    
    // Update profile section
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileAge = document.getElementById('profile-age');
    const profileStage = document.getElementById('profile-stage');
    const profileJoined = document.getElementById('profile-joined');
    
    if (profileName) profileName.textContent = `${user.firstName} ${user.lastName}`;
    if (profileEmail) profileEmail.textContent = user.email;
    if (profileAge) profileAge.textContent = user.age || '-';
    if (profileStage) profileStage.textContent = user.menopauseStage ? user.menopauseStage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-';
    if (profileJoined) profileJoined.textContent = new Date(user.createdAt).toLocaleDateString();
    
    // Update profile stats
    const profileDaysTracked = document.getElementById('profile-days-tracked');
    const profileSymptomsLogged = document.getElementById('profile-symptoms-logged');
    const profileMedicationsTaken = document.getElementById('profile-medications-taken');
    const profileGoalsAchieved = document.getElementById('profile-goals-achieved');
    
    if (profileDaysTracked) profileDaysTracked.textContent = user.data.goals.daysTracked;
    if (profileSymptomsLogged) profileSymptomsLogged.textContent = user.data.goals.symptomsLogged;
    if (profileMedicationsTaken) profileMedicationsTaken.textContent = user.data.goals.medicationsTaken;
    if (profileGoalsAchieved) profileGoalsAchieved.textContent = user.data.goals.goalsAchieved;
}

function toggleUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    userMenu.classList.toggle('active');
}

async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            const token = getAuthToken();
            if (token) {
                    await fetch(`${getApiBaseUrl()}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.href = 'login.html';
        }
    }
}

function editProfile() {
    alert('Profile editing feature will be implemented in a future update.');
}

function changePassword() {
    alert('Password change feature will be implemented in a future update.');
}

// Close user menu when clicking outside
document.addEventListener('click', function(e) {
    const userMenu = document.querySelector('.user-menu');
    if (userMenu && !userMenu.contains(e.target)) {
        userMenu.classList.remove('active');
    }
});

// Initialize reports when section is shown
document.addEventListener('DOMContentLoaded', function() {
    const reportsSection = document.getElementById('reports');
    if (reportsSection) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (reportsSection.classList.contains('active')) {
                        updateReports();
                    }
                }
            });
        });
        observer.observe(reportsSection, { attributes: true });
    }
});

// Initialize medications when section is shown
document.addEventListener('DOMContentLoaded', function() {
    const medicationsSection = document.getElementById('medications');
    if (medicationsSection) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (medicationsSection.classList.contains('active')) {
                        updateMedicationsList();
                        updateReminders();
                    }
                }
            });
        });
        observer.observe(medicationsSection, { attributes: true });
    }
});
