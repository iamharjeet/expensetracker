//const API_URL = 'http://localhost:8080/api';
let budgets = [];
let categories = [];
let editingBudgetId = null;

// Month names for display
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadBudgets();
    setupFormSubmit();
    setCurrentMonthYear();
});

// Set current month and year as default
function setCurrentMonthYear() {
    const now = new Date();
    document.getElementById('month').value = now.getMonth() + 1;
    document.getElementById('year').value = now.getFullYear();
}

// Load categories for dropdown
async function loadCategories() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/categories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            categories = await response.json();
            populateCategoryDropdown();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Populate category dropdown
function populateCategoryDropdown() {
    const select = document.getElementById('categoryId');
    select.innerHTML = '<option value="">Select Category</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = `${category.name} (${category.type})`;
        select.appendChild(option);
    });
}

// Load all budgets
async function loadBudgets() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    showLoading(true);

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/budgets/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            budgets = await response.json();
            displayBudgets();
        } else if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
        }
    } catch (error) {
        console.error('Error loading budgets:', error);
        showMessage('Error loading budgets', 'error');
    } finally {
        showLoading(false);
    }
}

// Display budgets
function displayBudgets() {
    const budgetList = document.getElementById('budgetList');
    const emptyState = document.getElementById('emptyState');
    const budgetCount = document.getElementById('budgetCount');

    if (budgets.length === 0) {
        budgetList.innerHTML = '';
        emptyState.style.display = 'block';
        budgetCount.textContent = '0';
        return;
    }

    emptyState.style.display = 'none';
    budgetCount.textContent = budgets.length;

    budgetList.innerHTML = budgets.map(budget => {
        const percentage = budget.monthlyLimit > 0
            ? (budget.spent / budget.monthlyLimit * 100).toFixed(1)
            : 0;
        const statusClass = budget.isOverBudget ? 'over-budget' : 'on-budget';

        return `
            <div class="budget-item ${statusClass}">
                <div class="budget-info">
                    <div class="budget-header">
                        <h3>${budget.categoryName || 'Unknown Category'}</h3>
                        <span class="budget-period">${monthNames[budget.month - 1]} ${budget.year}</span>
                    </div>
                    <div class="budget-amounts">
                        <div class="spent-info ${budget.isOverBudget ? 'text-danger' : ''}">
                            <strong>Spent:</strong> $${budget.spent.toFixed(2)} / $${budget.monthlyLimit.toFixed(2)}
                            ${budget.isOverBudget ? '<span class="over-budget-badge">⚠️ OVER BUDGET</span>' : ''}
                        </div>
                        <div class="remaining-info ${budget.isOverBudget ? 'text-danger' : 'text-success'}">
                            <strong>Remaining:</strong> $${budget.remaining.toFixed(2)} (${percentage}% used)
                        </div>
                    </div>
                </div>
                <div class="budget-actions">
                    <button class="btn-edit" onclick="editBudget(${budget.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteBudget(${budget.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Setup form submit
function setupFormSubmit() {
    const form = document.getElementById('budgetForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userId = localStorage.getItem('userId');
        const budgetId = document.getElementById('budgetId').value;

        const budgetData = {
            userId: parseInt(userId),
            categoryId: parseInt(document.getElementById('categoryId').value),
            monthlyLimit: parseFloat(document.getElementById('monthlyLimit').value),
            month: parseInt(document.getElementById('month').value),
            year: parseInt(document.getElementById('year').value)
        };

        if (budgetId) {
            await updateBudget(budgetId, budgetData);
        } else {
            await createBudget(budgetData);
        }
    });
}

// Create budget
async function createBudget(budgetData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/budgets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(budgetData)
        });

        if (response.ok) {
            showMessage('Budget created successfully!', 'success');
            resetForm();
            loadBudgets();
        } else if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
        } else {
            showMessage('Error creating budget', 'error');
        }
    } catch (error) {
        console.error('Error creating budget:', error);
        showMessage('Error creating budget', 'error');
    }
}

// Edit budget
function editBudget(id) {
    const budget = budgets.find(b => b.id === id);
    if (!budget) return;

    document.getElementById('budgetId').value = budget.id;
    document.getElementById('categoryId').value = budget.categoryId;
    document.getElementById('monthlyLimit').value = budget.monthlyLimit;
    document.getElementById('month').value = budget.month;
    document.getElementById('year').value = budget.year;

    document.getElementById('formTitle').textContent = 'Edit Budget';
    document.getElementById('submitBtn').textContent = 'Update Budget';

    editingBudgetId = id;

    // Scroll to form
    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
}

// Update budget
async function updateBudget(id, budgetData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/budgets/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(budgetData)
        });

        if (response.ok) {
            showMessage('Budget updated successfully!', 'success');
            resetForm();
            loadBudgets();
        } else if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
        } else {
            showMessage('Error updating budget', 'error');
        }
    } catch (error) {
        console.error('Error updating budget:', error);
        showMessage('Error updating budget', 'error');
    }
}

// Delete budget
async function deleteBudget(id) {
    if (!confirm('Are you sure you want to delete this budget?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/budgets/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showMessage('Budget deleted successfully!', 'success');
            loadBudgets();
        } else if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
        } else {
            showMessage('Error deleting budget', 'error');
        }
    } catch (error) {
        console.error('Error deleting budget:', error);
        showMessage('Error deleting budget', 'error');
    }
}

// Reset form
function resetForm() {
    document.getElementById('budgetForm').reset();
    document.getElementById('budgetId').value = '';
    document.getElementById('formTitle').textContent = 'Add New Budget';
    document.getElementById('submitBtn').textContent = 'Add Budget';
    editingBudgetId = null;
    setCurrentMonthYear();
    hideMessage();
}

// Show loading spinner
function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
}

// Show message
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        hideMessage();
    }, 3000);
}

// Hide message
function hideMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.style.display = 'none';
}

// Handle unauthorized
function handleUnauthorized() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = 'login.html';
}