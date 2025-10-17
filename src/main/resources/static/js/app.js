// API Base URL
const API_BASE_URL = 'http://localhost:8080/api/users';

// State
let isEditMode = false;
let currentUserId = null;

// DOM Elements
const userForm = document.getElementById('userForm');
const usersTableBody = document.getElementById('usersTableBody');
const messageArea = document.getElementById('messageArea');
const loadingArea = document.getElementById('loadingArea');
const usersTableContainer = document.getElementById('usersTableContainer');
const emptyState = document.getElementById('emptyState');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const userIdInput = document.getElementById('userId');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();

    // Form submit event
    userForm.addEventListener('submit', handleFormSubmit);

    // Cancel button event
    cancelBtn.addEventListener('click', resetForm);
});

// Load all users
async function loadUsers() {
    try {
        showLoading();
        const response = await fetch(API_BASE_URL);

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const users = await response.json();
        displayUsers(users);
        hideLoading();
    } catch (error) {
        console.error('Error loading users:', error);
        showMessage('Error loading users. Please make sure the backend is running.', 'error');
        hideLoading();
    }
}


// Handle form submit (Add or Update)
async function handleFormSubmit(e) {
    e.preventDefault();

    const userData = {
        username: usernameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value
    };

    try {
        if (isEditMode) {
            await updateUser(currentUserId, userData);
        } else {
            await createUser(userData);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showMessage('Error saving user. Please try again.', 'error');
    }
}

// Create new user
async function createUser(userData) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Failed to create user');
        }

        showMessage('User created successfully!', 'success');
        resetForm();
        loadUsers();
    } catch (error) {
        throw error;
    }
}

// Update existing user
async function updateUser(id, userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Failed to update user');
        }

        showMessage('User updated successfully!', 'success');
        resetForm();
        loadUsers();
    } catch (error) {
        throw error;
    }
}

// Edit user (populate form)
async function editUser(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const user = await response.json();

        // Switch to edit mode
        isEditMode = true;
        currentUserId = id;

        // Update form
        formTitle.textContent = 'Update User';
        submitBtn.textContent = 'Update User';
        submitBtn.className = 'btn btn-warning';
        cancelBtn.style.display = 'inline-block';

        // Populate form fields
        userIdInput.value = user.id;
        usernameInput.value = user.username;
        emailInput.value = user.email;
        passwordInput.value = '';
        passwordInput.placeholder = 'Leave blank to keep current password';
        passwordInput.required = false;

        // Scroll to form
        userForm.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error('Error loading user for edit:', error);
        showMessage('Error loading user details.', 'error');
    }
}

// Delete user
async function deleteUser(id, username) {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        showMessage('User deleted successfully!', 'success');
        loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        showMessage('Error deleting user. Please try again.', 'error');
    }
}

// Reset form to add mode
function resetForm() {
    isEditMode = false;
    currentUserId = null;

    // Reset form
    userForm.reset();
    formTitle.textContent = 'Add New User';
    submitBtn.textContent = 'Add User';
    submitBtn.className = 'btn btn-success';
    cancelBtn.style.display = 'none';

    // Reset password field
    passwordInput.placeholder = '';
    passwordInput.required = true;

    userIdInput.value = '';
}

// Show message
function showMessage(message, type) {
    messageArea.innerHTML = `
        <div class="message message-${type}">
            ${message}
        </div>
    `;

    // Auto-hide after 3 seconds
    setTimeout(() => {
        messageArea.innerHTML = '';
    }, 3000);
}

// Show loading
function showLoading() {
    loadingArea.style.display = 'block';
    usersTableContainer.style.display = 'none';
    emptyState.style.display = 'none';
}

// Hide loading
function hideLoading() {
    loadingArea.style.display = 'none';
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Display users in table
function displayUsers(users) {
    usersTableBody.innerHTML = '';

    // Update user count
    const userCount = document.getElementById('userCount');
    if (userCount) {
        userCount.textContent = `${users.length} user${users.length !== 1 ? 's' : ''}`;
    }

    if (users.length === 0) {
        usersTableContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    usersTableContainer.style.display = 'block';
    emptyState.style.display = 'none';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${user.id}</strong></td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-small" onclick="editUser(${user.id})">✏️ Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteUser(${user.id}, '${user.username}')">🗑️ Delete</button>
                </div>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
}