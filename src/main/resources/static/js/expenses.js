// API Base URL
const API_URL = 'http://localhost:8080/api/expenses';

// State
let editMode = false;
let currentExpenseId = null;

// DOM Elements
const expenseForm = document.getElementById('expenseForm');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const expensesTableBody = document.getElementById('expensesTableBody');
const expenseCount = document.getElementById('expenseCount');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');
const expensesTableContainer = document.getElementById('expensesTableContainer');
const messageContainer = document.getElementById('messageContainer');

// Set today's date as default
document.getElementById('date').valueAsDate = new Date();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadExpenses();

    expenseForm.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', resetForm);
});

// Load all expenses
async function loadExpenses() {
    showLoading();

    try {
        const response = await fetch(API_URL);
        const expenses = await response.json();

        hideLoading();

        if (expenses.length === 0) {
            showEmptyState();
        } else {
            displayExpenses(expenses);
        }

        updateExpenseCount(expenses.length);
    } catch (error) {
        hideLoading();
        showMessage('Error loading expenses: ' + error.message, 'error');
    }
}

// Display expenses in table
function displayExpenses(expenses) {
    emptyState.style.display = 'none';
    expensesTableContainer.style.display = 'block';

    expensesTableBody.innerHTML = '';

    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.id}</td>
            <td>${expense.description}</td>
            <td>$${parseFloat(expense.amount).toFixed(2)}</td>
            <td>${formatDate(expense.date)}</td>
            <td>${expense.userId}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editExpense(${expense.id})">Edit</button>
                <button class="btn-delete" onclick="deleteExpense(${expense.id})">Delete</button>
            </td>
        `;
        expensesTableBody.appendChild(row);
    });
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    const expenseData = {
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        date: document.getElementById('date').value,
        userId: parseInt(document.getElementById('userId').value)
    };

    try {
        if (editMode) {
            await updateExpense(currentExpenseId, expenseData);
        } else {
            await createExpense(expenseData);
        }
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// Create new expense
async function createExpense(expenseData) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
    });

    if (response.ok) {
        showMessage('Expense added successfully!', 'success');
        resetForm();
        loadExpenses();
    } else {
        throw new Error('Failed to create expense');
    }
}

// Update expense
async function updateExpense(id, expenseData) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
    });

    if (response.ok) {
        showMessage('Expense updated successfully!', 'success');
        resetForm();
        loadExpenses();
    } else {
        throw new Error('Failed to update expense');
    }
}

// Edit expense
async function editExpense(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const expense = await response.json();

        // Populate form
        document.getElementById('expenseId').value = expense.id;
        document.getElementById('description').value = expense.description;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('date').value = expense.date;
        document.getElementById('userId').value = expense.userId;

        // Switch to edit mode
        editMode = true;
        currentExpenseId = id;
        formTitle.textContent = 'Edit Expense';
        submitBtn.textContent = 'Update Expense';
        cancelBtn.style.display = 'inline-block';

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        showMessage('Error loading expense: ' + error.message, 'error');
    }
}

// Delete expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Expense deleted successfully!', 'success');
            loadExpenses();
        } else {
            throw new Error('Failed to delete expense');
        }
    } catch (error) {
        showMessage('Error deleting expense: ' + error.message, 'error');
    }
}

// Reset form
function resetForm() {
    expenseForm.reset();
    document.getElementById('expenseId').value = '';
    document.getElementById('date').valueAsDate = new Date();

    editMode = false;
    currentExpenseId = null;
    formTitle.textContent = 'Add New Expense';
    submitBtn.textContent = 'Add Expense';
    cancelBtn.style.display = 'none';
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Update expense count
function updateExpenseCount(count) {
    expenseCount.textContent = count;
}

// Show loading
function showLoading() {
    loadingSpinner.style.display = 'flex';
    emptyState.style.display = 'none';
    expensesTableContainer.style.display = 'none';
}

// Hide loading
function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Show empty state
function showEmptyState() {
    emptyState.style.display = 'flex';
    expensesTableContainer.style.display = 'none';
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    messageContainer.innerHTML = '';
    messageContainer.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}