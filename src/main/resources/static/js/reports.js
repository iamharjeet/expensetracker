// API Base URL
//const API_URL = 'http://localhost:8080/api';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setDefaultDates();
    setCurrentMonthYear();
    displayUserInfo();
});

// Set default dates for CSV export (current month)
function setDefaultDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    document.getElementById('exportStartDate').valueAsDate = firstDay;
    document.getElementById('exportEndDate').valueAsDate = lastDay;
}

// Set current month and year for summary
function setCurrentMonthYear() {
    const today = new Date();
    document.getElementById('summaryMonth').value = today.getMonth() + 1;
    document.getElementById('summaryYear').value = today.getFullYear();
}

// Display user info
function displayUserInfo() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('userWelcome').textContent = `Welcome, ${username}!`;
    }
}

// Load Monthly Summary
async function loadMonthlySummary() {
    const userId = localStorage.getItem('userId');
    const month = document.getElementById('summaryMonth').value;
    const year = document.getElementById('summaryYear').value;
    const token = localStorage.getItem('token');

    if (!userId || !token) {
        showMessage('Please login first', 'error');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`${API_URL}/reports/monthly-summary?userId=${userId}&month=${month}&year=${year}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to load summary');
        }

        const data = await response.json();
        displayMonthlySummary(data);

    } catch (error) {
        console.error('Error loading summary:', error);
        showMessage('Error loading monthly summary', 'error');
    } finally {
        showLoading(false);
    }
}

// Display Monthly Summary
function displayMonthlySummary(data) {
    // Show summary section
    document.getElementById('summaryDisplay').style.display = 'block';

    // Display amounts
    document.getElementById('totalIncome').textContent = formatCurrency(data.totalIncome);
    document.getElementById('totalExpenses').textContent = formatCurrency(data.totalExpenses);

    const netBalance = document.getElementById('netBalance');
    netBalance.textContent = formatCurrency(data.netBalance);

    // Color code the balance (green for positive, red for negative)
    if (data.netBalance >= 0) {
        netBalance.style.color = '#27ae60';
    } else {
        netBalance.style.color = '#e74c3c';
    }

    // Display top spending categories
    displayTopCategories(data.topSpendingCategories);

    showMessage('Summary loaded successfully', 'success');
}

// Display Top Spending Categories
function displayTopCategories(categories) {
    const container = document.getElementById('topCategoriesList');

    if (!categories || categories.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d;">No expense data for this month</p>';
        return;
    }

    let html = '<table class="category-table"><thead><tr><th>Rank</th><th>Category</th><th>Amount</th></tr></thead><tbody>';

    categories.forEach((cat, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${cat.categoryName}</td>
                <td>${formatCurrency(cat.totalAmount)}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Export to CSV
async function exportToCSV() {
    const userId = localStorage.getItem('userId');
    const startDate = document.getElementById('exportStartDate').value;
    const endDate = document.getElementById('exportEndDate').value;
    const token = localStorage.getItem('token');

    if (!userId || !token) {
        showMessage('Please login first', 'error');
        return;
    }

    if (!startDate || !endDate) {
        showMessage('Please select both start and end dates', 'error');
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        showMessage('Start date must be before end date', 'error');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`${API_URL}/reports/export-csv?userId=${userId}&startDate=${startDate}&endDate=${endDate}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to export CSV');
        }

        // Get the blob from response
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses_${startDate}_to_${endDate}.csv`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showMessage('CSV exported successfully', 'success');

    } catch (error) {
        console.error('Error exporting CSV:', error);
        showMessage('Error exporting CSV', 'error');
    } finally {
        showLoading(false);
    }
}

// Format currency
function formatCurrency(amount) {
    if (amount === null || amount === undefined) {
        return '$0.00';
    }
    return '$' + parseFloat(amount).toFixed(2);
}

// Show loading spinner
function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
}

// Show message
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}