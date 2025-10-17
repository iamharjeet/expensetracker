//const API_URL = 'http://localhost:8080/api';

// Get headers with authentication token
function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Load all users
async function loadUsers() {
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('emptyState');
    const usersTable = document.getElementById('usersTable');
    const usersTableBody = document.getElementById('usersTableBody');
    const userCount = document.getElementById('userCount');

    try {
        loading.style.display = 'block';

        const response = await fetch(`${API_URL}/users`, {
            headers: getAuthHeaders()
        });

        if (response.status === 403 || response.status === 401) {
            // Unauthorized - redirect to login
            logout();
            return;
        }

        const users = await response.json();

        usersTableBody.innerHTML = '';
        userCount.textContent = users.length;

        if (users.length === 0) {
            emptyState.style.display = 'block';
            usersTable.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            usersTable.style.display = 'table';

            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>
                        <button class="btn btn-small btn-secondary" onclick="editUser(${user.id})">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="deleteUser(${user.id})">Delete</button>
                    </td>
                `;
                usersTableBody.appendChild(row);
            });
        }
    } catch (error) {
        showMessage('Error loading users: ' + error.message, 'error');
    } finally {
        loading.style.display = 'none';
    }
}

// Add or Update user
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('userId').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const userData = { username, email, password };

    try {
        let response;
        if (userId) {
            // Update existing user
            response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(userData)
            });
        } else {
            // Create new user
            response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(userData)
            });
        }

        if (response.status === 403 || response.status === 401) {
            logout();
            return;
        }

        if (response.ok) {
            showMessage(userId ? 'User updated successfully!' : 'User added successfully!', 'success');
            resetForm();
            loadUsers();
        } else {
            showMessage('Error saving user', 'error');
        }
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
});

// Edit user
async function editUser(id) {
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            headers: getAuthHeaders()
        });

        if (response.status === 403 || response.status === 401) {
            logout();
            return;
        }

        const user = await response.json();

        document.getElementById('userId').value = user.id;
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        document.getElementById('password').value = '';
        document.getElementById('formTitle').textContent = 'Edit User';
        document.getElementById('submitBtnText').textContent = 'Update User';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        showMessage('Error loading user: ' + error.message, 'error');
    }
}

// Delete user
async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.status === 403 || response.status === 401) {
            logout();
            return;
        }

        if (response.ok) {
            showMessage('User deleted successfully!', 'success');
            loadUsers();
        } else {
            showMessage('Error deleting user', 'error');
        }
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// Reset form
function resetForm() {
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('formTitle').textContent = 'Add New User';
    document.getElementById('submitBtnText').textContent = 'Add User';
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