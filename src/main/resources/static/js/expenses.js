//const API_URL = 'http://localhost:8080/api';
let editingExpenseId = null;
let currentUserId = null;
let categories = [];
let accounts = [];
let expenseReceipts = {}; // NEW: Store receipt info for each expense

// Pagination and filter state
let currentPage = 0;
let totalPages = 0;
let pageSize = 100;
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

// Load expenses with pagination and filters
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
            // Load receipts for all expenses
            loadReceiptsForExpenses(data.expenses);
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

// NEW: Load receipts for all expenses
function loadReceiptsForExpenses(expenses) {
    const token = localStorage.getItem('token');
    expenseReceipts = {}; // Reset

    expenses.forEach(expense => {
        fetch(`${API_URL}/receipts/expense/${expense.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return null;
        })
        .then(receipt => {
            if (receipt) {
                expenseReceipts[expense.id] = receipt;
                updateReceiptCell(expense.id);
            }
        })
        .catch(error => {
            // Receipt not found is okay, just ignore
        });
    });
}

// NEW: Update receipt cell for a specific expense
function updateReceiptCell(expenseId) {
    const cell = document.getElementById(`receipt-${expenseId}`);
    if (cell && expenseReceipts[expenseId]) {
        const receipt = expenseReceipts[expenseId];
        cell.innerHTML = `
            <a href="#" onclick="downloadReceipt(${receipt.id}, '${receipt.filename}'); return false;"
               style="color: #7c3aed; text-decoration: none;">
                📎 ${receipt.filename}
            </a>
        `;
    }
}

function displayExpenses(expenses) {

    const tbody = document.getElementById('expensesTableBody');
    const emptyState = document.getElementById('emptyState');
    const expenseCount = document.getElementById('expenseCount');

    // Handle undefined or null expenses
    if (!expenses || expenses.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        expenseCount.textContent = '0';
        return;
    }

    emptyState.style.display = 'none';
    expenseCount.textContent = expenses.length;

    tbody.innerHTML = expenses.map(expense => `
        <tr>
            <td>${formatDate(expense.date)}</td>
            <td>${expense.description}</td>
            <td>$${formatAmount(expense.amount)}</td>
            <td>${expense.categoryName || 'N/A'}</td>
            <td>${expense.accountName || 'N/A'}</td>
            <td id="receipt-${expense.id}">-</td>
            <td class="actions">
                <button onclick="editExpense(${expense.id})" class="btn-edit">Edit</button>
                <button onclick="deleteExpense(${expense.id})" class="btn-delete">Delete</button>
            </td>
        </tr>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatAmount(amount) {
    return parseFloat(amount).toFixed(2);
}

function updatePaginationControls(data) {
    totalPages = data.totalPages || 0;
    currentPage = data.currentPage || 0;

    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages} (${data.totalItems || 0} total)`;

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.disabled = !data.hasPrevious;
    nextBtn.disabled = !data.hasNext;
}

function goToPreviousPage() {
    if (currentPage > 0) {
        currentPage--;
        loadExpenses();
    }
}

function goToNextPage() {
    if (currentPage < totalPages - 1) {
        currentPage++;
        loadExpenses();
    }
}

function applyFilters() {
    filters.startDate = document.getElementById('filterStartDate').value || null;
    filters.endDate = document.getElementById('filterEndDate').value || null;
    filters.categoryId = document.getElementById('filterCategoryId').value || null;
    filters.accountId = document.getElementById('filterAccountId').value || null;
    filters.searchTerm = document.getElementById('filterSearch').value || null;

    currentPage = 0; // Reset to first page
    loadExpenses();
}

function clearFilters() {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterCategoryId').value = '';
    document.getElementById('filterAccountId').value = '';
    document.getElementById('filterSearch').value = '';

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

// Debounced search
function onSearchChange() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        applyFilters();
    }, 500);
}

async function handleSubmit(event) {
    event.preventDefault();

    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    const categoryId = document.getElementById('categoryId').value;
    const accountId = document.getElementById('accountId').value;

    const expenseData = {
        description: description,
        amount: parseFloat(amount),
        date: date,
        userId: currentUserId,
        categoryId: categoryId ? parseInt(categoryId) : null,
        accountId: accountId ? parseInt(accountId) : null
    };

    if (editingExpenseId) {
        await updateExpense(editingExpenseId, expenseData);
    } else {
        await createExpense(expenseData);
    }
}

// NEW: Updated createExpense to handle receipt upload
async function createExpense(expenseData) {
    showLoading(true);
    const token = localStorage.getItem('token');

    try {
        // First, create the expense
        const response = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(expenseData)
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }

        const createdExpense = await response.json();

        // Then, upload receipt if file is selected
        const receiptFile = document.getElementById('receiptFile').files[0];
        if (receiptFile) {
            await uploadReceipt(createdExpense.id, receiptFile);
        }

        showMessage('Expense created successfully!', 'success');
        resetForm();
        loadExpenses();
    } catch (error) {
        console.error('Error creating expense:', error);
        showMessage('Error creating expense', 'error');
    } finally {
        showLoading(false);
    }
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
        document.getElementById('expenseId').value = expense.id;
        document.getElementById('description').value = expense.description;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('date').value = expense.date;
        document.getElementById('categoryId').value = expense.categoryId || '';
        document.getElementById('accountId').value = expense.accountId || '';

        // Clear receipt file input (can't pre-populate file inputs for security)
        document.getElementById('receiptFile').value = '';

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

// NEW: Updated updateExpense to handle receipt upload
async function updateExpense(id, expenseData) {
    showLoading(true);
    const token = localStorage.getItem('token');

    try {
        // First, update the expense
        const response = await fetch(`${API_URL}/expenses/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(expenseData)
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }

        await response.json();

        // Then, upload new receipt if file is selected
        const receiptFile = document.getElementById('receiptFile').files[0];
        if (receiptFile) {
            await uploadReceipt(id, receiptFile);
        }

        showMessage('Expense updated successfully!', 'success');
        resetForm();
        loadExpenses();
    } catch (error) {
        console.error('Error updating expense:', error);
        showMessage('Error updating expense', 'error');
    } finally {
        showLoading(false);
    }
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

// NEW: Upload receipt function (Updated for S3)
async function uploadReceipt(expenseId, file) {
    const token = localStorage.getItem('token');


    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', currentUserId); //  ADDED: userId for S3 organization
    formData.append('expenseId', expenseId);

    // DEBUG: Log FormData contents
        console.log('FormData contents:');
        for (let pair of formData.entries()) {
            console.log(pair[0] + ':', pair[1]);
        }

    try {
        const response = await fetch(`${API_URL}/receipts/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }

        if (!response.ok) {
            throw new Error('Receipt upload failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Error uploading receipt:', error);
        showMessage('Error uploading receipt', 'error');
        throw error;
    }
}

// NEW: Download receipt function (Updated for S3 pre-signed URLs)
async function downloadReceipt(receiptId, filename) {
    const token = localStorage.getItem('token');

    try {
        showMessage('Generating download link...', 'info');

        // Get pre-signed URL from backend
        const response = await fetch(`${API_URL}/receipts/${receiptId}/url`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to get receipt URL');
        }

        const data = await response.json();

        // Open the pre-signed URL in a new tab
        window.open(data.presignedUrl, '_blank');

    } catch (error) {
        console.error('Error downloading receipt:', error);
        showMessage('Error downloading receipt', 'error');
    }
}

function cancelEdit() {
    resetForm();
}

function resetForm() {
    editingExpenseId = null;
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseId').value = '';
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