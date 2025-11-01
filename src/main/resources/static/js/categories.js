//const API_URL = 'http://localhost:8080/api';
let allCategories = [];
let currentFilter = 'ALL';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    displayUsername();
    loadCategories();
});

function displayUsername() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('userWelcome').textContent = `Welcome, ${username}!`;
    }
}

function loadCategories() {
    showLoading(true);
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/api/categories`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        return response.json();
    })
    .then(data => {
        allCategories = data;
        displayCategories(allCategories);
        showLoading(false);
    })
    .catch(error => {
        console.error('Error loading categories:', error);
        showMessage('Error loading categories', 'error');
        showLoading(false);
    });
}

function filterCategories(type) {
    currentFilter = type;

    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Filter and display
    let filtered = allCategories;
    if (type !== 'ALL') {
        filtered = allCategories.filter(cat => cat.type === type);
    }

    displayCategories(filtered);
}

function displayCategories(categories) {
    const grid = document.getElementById('categoriesGrid');

    if (categories.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No categories found.</p></div>';
        return;
    }

    grid.innerHTML = categories.map(category => `
        <div class="category-card ${category.type.toLowerCase()}">
            <div class="category-icon">${getCategoryIcon(category.type)}</div>
            <div class="category-info">
                <h3>${category.name}</h3>
                <span class="category-type">${category.type}</span>
            </div>
        </div>
    `).join('');
}

function getCategoryIcon(type) {
    return type === 'INCOME' ? '💰' : '💸';
}

function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}