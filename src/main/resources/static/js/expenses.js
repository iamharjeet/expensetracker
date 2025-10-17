//const API_URL = 'http://localhost:8080/api';

// Get headers with authentication token
function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Load all expenses
async function loadExpenses() {
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('emptyState');
    const expensesTable = document.getElementById('expensesTable');
    const expensesTableBody = document.getElementById('expensesTableBody');
    const expenseCount = document.getElementById('expenseCount');

    try {
        loading.style.display = 'block';

        const response = await fetch(`${API_URL}/expenses`, {
            headers: getAuthHeaders()
        });

        if (response.status === 403 || response.status === 401) {
            // Unauthorized - redirect to login
            logout();
            return;
        }

        const expenses = await response.json();

        expensesTableBody.innerHTML = '';
        expenseCount.textContent = expenses.length;

        if (expenses.length === 0) {
            emptyState.style.display = 'block';
            expensesTable.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            expensesTable.style.display = 'table';

            expenses.forEach(expense => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${expense.description}</td>
                    <td>$${parseFloat(expense.amount).toFixed(2)}</td>
                    <td>${formatDate(expense.date)}</td>
                    <td>${expense.userId}</td>
                    <td>
                        <button class="btn btn-small btn-secondary" onclick="editExpense(${expense.id})">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="deleteExpense(${expense.id})">Delete</button>
                    </td>
                `;
                expensesTableBody.appendChild(row);
            });
        }
    } catch (error) {
        showMessage('Error loading expenses: ' + error.message, 'error');
    } finally {
        loading.style.display = 'none';
    }
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

// Add or Update expense
document.getElementById('expenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const expenseId = document.getElementById('expenseId').value;
    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    const userId = document.getElementById('userId').value;

    const expenseData = { description, amount, date, userId };

    try {
        let response;
        if (expenseId) {
            // Update existing expense
            response = await fetch(`${API_URL}/expenses/${expenseId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(expenseData)
            });
        } else {
            // Create new expense
            response = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(expenseData)
            });
        }

        if (response.status === 403 || response.status === 401) {
            logout();
            return;
        }

        if (response.ok) {
            showMessage(expenseId ? 'Expense updated successfully!' : 'Expense added successfully!', 'success');
            resetForm();
            loadExpenses();
        } else {
            showMessage('Error saving expense', 'error');
        }
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
});

// Edit expense
async function editExpense(id) {
    try {
        const response = await fetch(`${API_URL}/expenses/${id}`, {
            headers: getAuthHeaders()
        });

        if (response.status === 403 || response.status === 401) {
            logout();
            return;
        }

        const expense = await response.json();

        document.getElementById('expenseId').value = expense.id;
        document.getElementById('description').value = expense.description;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('date').value = expense.date;
        document.getElementById('userId').value = expense.userId;
        document.getElementById('formTitle').textContent = 'Edit Expense';
        document.getElementById('submitBtnText').textContent = 'Update Expense';

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
        const response = await fetch(`${API_URL}/expenses/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.status === 403 || response.status === 401) {
            logout();
            return;
        }

        if (response.ok) {
            showMessage('Expense deleted successfully!', 'success');
            loadExpenses();
        } else {
            showMessage('Error deleting expense', 'error');
        }
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// Reset form
function resetForm() {
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseId').value = '';
    document.getElementById('formTitle').textContent = 'Add New Expense';
    document.getElementById('submitBtnText').textContent = 'Add Expense';
    document.getElementById('date').valueAsDate = new Date();
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}