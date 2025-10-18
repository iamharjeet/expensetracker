//const API_URL = 'http://localhost:8080/api';
let editingExpenseId = null;
let currentUserId = null;
let categories = [];
let accounts = [];

// Pagination and filter state
let currentPage = 0;
let totalPages = 0;
let pageSize = 10;
let filters = {
    startDate: null,
    endDate: null,
    categoryId: null,
    accountId: null,
    searchTerm: null
};

// Debounce timer for search
let searchDebounceTimer = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    displayUsername();
    currentUserId = localStorage.getItem('userId');
    setDefaultDate();
    loadCategories();
    loadAccounts();
    loadExpenses();

    // Form submit handler
    document.getElementById('expenseForm').addEventListener('submit', handleSubmit);
});

function displayUsername() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('userWelcome').textContent = `Welcome, ${username}!`;
    }
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

function loadCategories() {
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/categories`, {
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
        categories = data;
        populateCategoryDropdown();
        populateFilterCategoryDropdown();
    })
    .catch(error => {
        console.error('Error loading categories:', error);
    });
}

function populateCategoryDropdown() {
    const categorySelect = document.getElementById('categoryId');
    categorySelect.innerHTML = '<option value="">Select Category</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = `${category.name} (${category.type})`;
        categorySelect.appendChild(option);
    });
}

function populateFilterCategoryDropdown() {
    const filterCategorySelect = document.getElementById('filterCategoryId');
    filterCategorySelect.innerHTML = '<option value="">All Categories</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = `${category.name} (${category.type})`;
        filterCategorySelect.appendChild(option);
    });
}

function loadAccounts() {
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/accounts/user/${currentUserId}`, {
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
        accounts = data;
        populateAccountDropdown();
        populateFilterAccountDropdown();
    })
    .catch(error => {
        console.error('Error loading accounts:', error);
    });
}

function populateAccountDropdown() {
    const accountSelect = document.getElementById('accountId');
    accountSelect.innerHTML = '<option value="">Select Account</option>';

    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.name} (${account.type})`;
        accountSelect.appendChild(option);
    });
}

function populateFilterAccountDropdown() {
    const filterAccountSelect = document.getElementById('filterAccountId');
    filterAccountSelect.innerHTML = '<option value="">All Accounts</option>';

    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.name} (${account.type})`;
        filterAccountSelect.appendChild(option);
    });
}

// NEW: Load expenses with pagination and filters
function loadExpenses() {
    showLoading(true);
    const token = localStorage.getItem('token');

    // Build query parameters
    let queryParams = `page=${currentPage}&size=${pageSize}`;

    if (filters.startDate) {
        queryParams += `&startDate=${filters.startDate}`;
    }
    if (filters.endDate) {
        queryParams += `&endDate=${filters.endDate}`;
    }
    if (filters.categoryId) {
        queryParams += `&categoryId=${filters.categoryId}`;
    }
    if (filters.accountId) {
        queryParams += `&accountId=${filters.accountId}`;
    }
    if (filters.searchTerm) {
        queryParams += `&searchTerm=${encodeURIComponent(filters.searchTerm)}`;
    }

    fetch(`${API_URL}/expenses/user/${currentUserId}/paginated?${queryParams}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data && data.expenses) {
            displayExpenses(data.expenses);
            updatePaginationControls(data);
        } else {
            console.error('Invalid response structure:', data);
            displayExpenses([]);
            updatePaginationControls({ totalPages: 0, currentPage: 0, hasNext: false, hasPrevious: false });
        }
        showLoading(false);
    })
    .catch(error => {
        console.error('Error loading expenses:', error);
        showMessage('Error loading expenses', 'error');
        showLoading(false);
    });
}

function displayExpenses(expenses) {
    const tbody = document.getElementById('expensesTableBody');
    const emptyState = document.getElementById('emptyState');
    const expenseCount = document.getElementById('expenseCount');

    // Handle undefined or null expenses
    if (!expenses || !Array.isArray(expenses)) {
        expenses = [];
    }

    expenseCount.textContent = expenses.length;

    if (expenses.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tbody.innerHTML = expenses.map(expense => `
        <tr>
            <td>${formatDate(expense.date)}</td>
            <td>${expense.description}</td>
            <td>${expense.categoryName || '-'}</td>
            <td>${expense.accountName || '-'}</td>
            <td class="amount">$${parseFloat(expense.amount).toFixed(2)}</td>
            <td>
                <button onclick="editExpense(${expense.id})" class="btn-edit">Edit</button>
                <button onclick="deleteExpense(${expense.id})" class="btn-delete">Delete</button>
            </td>
        </tr>
    `).join('');
}

// NEW: Update pagination controls
function updatePaginationControls(data) {
    totalPages = data.totalPages;
    const paginationControls = document.getElementById('paginationControls');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Show/hide pagination controls
    if (totalPages > 1) {
        paginationControls.style.display = 'flex';
    } else {
        paginationControls.style.display = 'none';
    }

    // Update page info
    pageInfo.textContent = `Page ${data.currentPage + 1} of ${totalPages}`;

    // Enable/disable buttons
    prevBtn.disabled = !data.hasPrevious;
    nextBtn.disabled = !data.hasNext;
}

// NEW: Apply filters
function applyFilters() {
    filters.startDate = document.getElementById('filterStartDate').value || null;
    filters.endDate = document.getElementById('filterEndDate').value || null;
    filters.categoryId = document.getElementById('filterCategoryId').value || null;
    filters.accountId = document.getElementById('filterAccountId').value || null;

    // Reset to first page when filters change
    currentPage = 0;
    loadExpenses();
}

// NEW: Handle search with debounce
function handleSearchDebounced() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        filters.searchTerm = document.getElementById('searchTerm').value.trim() || null;
        currentPage = 0;
        loadExpenses();
    }, 500); // Wait 500ms after user stops typing
}

// NEW: Clear all filters
function clearFilters() {
    document.getElementById('searchTerm').value = '';
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterCategoryId').value = '';
    document.getElementById('filterAccountId').value = '';

    filters = {
        startDate: null,
        endDate: null,
        categoryId: null,
        accountId: null,
        searchTerm: null
    };

    currentPage = 0;
    loadExpenses();
}

// NEW: Go to next page
function goToNextPage() {
    if (currentPage < totalPages - 1) {
        currentPage++;
        loadExpenses();
    }
}

// NEW: Go to previous page
function goToPreviousPage() {
    if (currentPage > 0) {
        currentPage--;
        loadExpenses();
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function handleSubmit(e) {
    e.preventDefault();

    const categoryId = document.getElementById('categoryId').value;
    const accountId = document.getElementById('accountId').value;

    const expenseData = {
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        date: document.getElementById('date').value,
        userId: currentUserId,
        categoryId: categoryId ? parseInt(categoryId) : null,
        accountId: accountId ? parseInt(accountId) : null
    };

    if (editingExpenseId) {
        updateExpense(editingExpenseId, expenseData);
    } else {
        createExpense(expenseData);
    }
}

function createExpense(expenseData) {
    showLoading(true);
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseData)
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        return response.json();
    })
    .then(data => {
        showMessage('Expense created successfully!', 'success');
        resetForm();
        loadExpenses();
        showLoading(false);
    })
    .catch(error => {
        console.error('Error creating expense:', error);
        showMessage('Error creating expense', 'error');
        showLoading(false);
    });
}

function editExpense(id) {
    showLoading(true);
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/expenses/${id}`, {
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
    .then(expense => {
        editingExpenseId = expense.id;
        document.getElementById('description').value = expense.description;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('date').value = expense.date;
        document.getElementById('categoryId').value = expense.categoryId || '';
        document.getElementById('accountId').value = expense.accountId || '';

        document.getElementById('formTitle').textContent = 'Edit Expense';
        document.getElementById('submitBtnText').textContent = 'Update Expense';
        document.getElementById('cancelBtn').style.display = 'inline-block';

        showLoading(false);
    })
    .catch(error => {
        console.error('Error loading expense:', error);
        showMessage('Error loading expense', 'error');
        showLoading(false);
    });
}

function updateExpense(id, expenseData) {
    showLoading(true);
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseData)
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        return response.json();
    })
    .then(data => {
        showMessage('Expense updated successfully!', 'success');
        resetForm();
        loadExpenses();
        showLoading(false);
    })
    .catch(error => {
        console.error('Error updating expense:', error);
        showMessage('Error updating expense', 'error');
        showLoading(false);
    });
}

function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    showLoading(true);
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        showMessage('Expense deleted successfully!', 'success');
        loadExpenses();
        showLoading(false);
    })
    .catch(error => {
        console.error('Error deleting expense:', error);
        showMessage('Error deleting expense', 'error');
        showLoading(false);
    });
}

function cancelEdit() {
    resetForm();
}

function resetForm() {
    editingExpenseId = null;
    document.getElementById('expenseForm').reset();
    setDefaultDate();
    document.getElementById('formTitle').textContent = 'Add New Expense';
    document.getElementById('submitBtnText').textContent = 'Add Expense';
    document.getElementById('cancelBtn').style.display = 'none';
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