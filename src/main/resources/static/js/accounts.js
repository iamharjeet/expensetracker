//const API_URL = 'http://localhost:8080/api';
let editingAccountId = null;
let currentUserId = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    displayUsername();
    currentUserId = localStorage.getItem('userId');
    loadAccounts();

    // Form submit handler
    document.getElementById('accountForm').addEventListener('submit', handleSubmit);
});

function displayUsername() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('userWelcome').textContent = `Welcome, ${username}!`;
    }
}

function loadAccounts() {
    showLoading(true);
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/api/accounts/user/${currentUserId}`, {
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
        displayAccounts(data);
        showLoading(false);
    })
    .catch(error => {
        console.error('Error loading accounts:', error);
        showMessage('Error loading accounts', 'error');
        showLoading(false);
    });
}

function displayAccounts(accounts) {
    const tbody = document.getElementById('accountsTableBody');
    const emptyState = document.getElementById('emptyState');
    const accountCount = document.getElementById('accountCount');

    accountCount.textContent = accounts.length;

    if (accounts.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tbody.innerHTML = accounts.map(account => `
        <tr>
            <td>${account.name}</td>
            <td><span class="account-type-badge">${account.type}</span></td>
            <td class="amount">$${parseFloat(account.balance).toFixed(2)}</td>
            <td>
                <button onclick="editAccount(${account.id})" class="btn-edit">Edit</button>
                <button onclick="deleteAccount(${account.id})" class="btn-delete">Delete</button>
            </td>
        </tr>
    `).join('');
}

function handleSubmit(e) {
    e.preventDefault();

    const accountData = {
        name: document.getElementById('name').value,
        type: document.getElementById('type').value,
        balance: parseFloat(document.getElementById('balance').value),
        userId: currentUserId
    };

    if (editingAccountId) {
        updateAccount(editingAccountId, accountData);
    } else {
        createAccount(accountData);
    }
}

function createAccount(accountData) {
    showLoading(true);
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/api/accounts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(accountData)
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        return response.json();
    })
    .then(data => {
        showMessage('Account created successfully!', 'success');
        resetForm();
        loadAccounts();
        showLoading(false);
    })
    .catch(error => {
        console.error('Error creating account:', error);
        showMessage('Error creating account', 'error');
        showLoading(false);
    });
}

function editAccount(id) {
    showLoading(true);
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/api/accounts/${id}`, {
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
    .then(account => {
        editingAccountId = account.id;
        document.getElementById('name').value = account.name;
        document.getElementById('type').value = account.type;
        document.getElementById('balance').value = account.balance;

        document.getElementById('formTitle').textContent = 'Edit Account';
        document.getElementById('submitBtnText').textContent = 'Update Account';
        document.getElementById('cancelBtn').style.display = 'inline-block';

        showLoading(false);
    })
    .catch(error => {
        console.error('Error loading account:', error);
        showMessage('Error loading account', 'error');
        showLoading(false);
    });
}

function updateAccount(id, accountData) {
    showLoading(true);
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/api/accounts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(accountData)
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        return response.json();
    })
    .then(data => {
        showMessage('Account updated successfully!', 'success');
        resetForm();
        loadAccounts();
        showLoading(false);
    })
    .catch(error => {
        console.error('Error updating account:', error);
        showMessage('Error updating account', 'error');
        showLoading(false);
    });
}

function deleteAccount(id) {
    if (!confirm('Are you sure you want to delete this account?')) {
        return;
    }

    showLoading(true);
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/api/accounts/${id}`, {
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
        showMessage('Account deleted successfully!', 'success');
        loadAccounts();
        showLoading(false);
    })
    .catch(error => {
        console.error('Error deleting account:', error);
        showMessage('Error deleting account', 'error');
        showLoading(false);
    });
}

function cancelEdit() {
    resetForm();
}

function resetForm() {
    editingAccountId = null;
    document.getElementById('accountForm').reset();
    document.getElementById('formTitle').textContent = 'Add New Account';
    document.getElementById('submitBtnText').textContent = 'Add Account';
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