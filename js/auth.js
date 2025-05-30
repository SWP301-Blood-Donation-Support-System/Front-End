// Blood Donation Support System - Authentication JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in (from localStorage)
    checkLoginStatus();
    
    // Setup logout button event listener
    setupLogoutButton();
});

// Check if user is logged in and update UI accordingly
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName') || 'Huy';
    
    // Get all auth containers across pages
    const authContainers = document.querySelectorAll('.auth-container');
      authContainers.forEach(container => {
        if (isLoggedIn) {            // Show logged in state with username and logout button
            container.innerHTML = `
                <div class="d-flex align-items-center">
                    <a href="account.html" class="text-decoration-none text-dark me-3">
                        <span><i class="fas fa-user-circle me-1"></i> Hello ${userName}!</span>
                    </a>
                    <button id="logoutBtn" class="btn btn-outline-secondary btn-sm me-2">Đăng Xuất</button>
                </div>
            `;
        } else {            // Show login/register buttons
            container.innerHTML = `
                <div class="d-flex">
                    <a href="login.html" class="btn btn-outline-secondary me-2">Đăng Nhập</a>
                    <a href="signup.html" class="btn btn-outline-secondary me-2">Đăng Ký</a>
                </div>
            `;
        }
    });
    
    // Setup logout button event handler
    setupLogoutButton();
}

// Set up logout button click handler
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear login status
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            
            // Show logout message
            showAlert('Bạn đã đăng xuất thành công!', 'success');
            
            // Redirect to index.html after a short delay
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 1500);
        });
    }
}

// Display alert message
function showAlert(message, type = 'info') {
    // Check if alert container exists, if not create it
    let alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alertContainer';
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '20px';
        alertContainer.style.right = '20px';
        alertContainer.style.zIndex = '9999';
        document.body.appendChild(alertContainer);
    }
    
    // Create alert element
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type} alert-dismissible fade show`;
    alertEl.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to container
    alertContainer.appendChild(alertEl);
    
    // Remove after 5 seconds
    setTimeout(function() {
        alertEl.classList.remove('show');
        setTimeout(function() {
            alertContainer.removeChild(alertEl);
        }, 150);
    }, 5000);
}
