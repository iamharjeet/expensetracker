//const API_URL = 'http://localhost:8080/api';
const API_URL = ""; // same origin

// Handle Login
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginBtn = document.getElementById('loginBtnText');
    const spinner = document.getElementById('loginSpinner');

    try {
        // Show loading state
        loginBtn.style.display = 'none';
        spinner.style.display = 'inline-block';

        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();

            // Store token and user info in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('email', data.email);
            localStorage.setItem('userId', data.userId);  // Add this line

            showMessage('Login successful! Redirecting...', 'success');

            // Redirect to users page after 1 second
            setTimeout(() => {
                window.location.href = 'users.html';
            }, 1000);
        } else {
            const errorText = await response.text();
            showMessage(errorText || 'Invalid username or password', 'error');
        }
    } catch (error) {
        showMessage('An error occurred. Please try again.', 'error');
        console.error('Login error:', error);
    } finally {
        // Reset button state
        loginBtn.style.display = 'inline';
        spinner.style.display = 'none';
    }
}

// Handle Register
async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate password match
    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
    }

    const registerBtn = document.getElementById('registerBtnText');
    const spinner = document.getElementById('registerSpinner');

    try {
        // Show loading state
        registerBtn.style.display = 'none';
        spinner.style.display = 'inline-block';

        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const responseText = await response.text();

        if (response.ok) {
            showMessage('Registration successful! Redirecting to login...', 'success');

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showMessage(responseText || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        showMessage('An error occurred. Please try again.', 'error');
        console.error('Register error:', error);
    } finally {
        // Reset button state
        registerBtn.style.display = 'inline';
        spinner.style.display = 'none';
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Get authentication token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Get current user info
function getCurrentUser() {
    return {
        username: localStorage.getItem('username'),
        email: localStorage.getItem('email')
    };
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');  // Add this line
    window.location.href = 'login.html';
}

// Show message to user
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}

// Protect page - redirect to login if not authenticated
function protectPage() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}