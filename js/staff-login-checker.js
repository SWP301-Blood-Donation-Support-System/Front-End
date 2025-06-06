// Staff Login Checker - Only handles staff-only sections visibility

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and has staff role
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    // Update navigation based on role
    if (isLoggedIn && userRole === 'staff') {
        // Update navbar for staff
        updateNavbarForStaff();
    } else {
        // Make sure all navbar items are visible
        updateNavbarForMember();
    }
    
    // Handle staff/member visibility based on role and login state
    if (isLoggedIn && userRole === 'staff') {
        document.querySelectorAll('.staff-only').forEach(el => {
            el.style.display = 'block';
        });
        document.querySelectorAll('.member-only').forEach(el => {
            el.style.display = 'none';
        });
    } else {
        document.querySelectorAll('.staff-only').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.member-only').forEach(el => {
            el.style.display = 'block';
        });
    }
});

// Listen for role changes
document.addEventListener('roleToggled', function(e) {
    // Just update UI elements based on role, no redirection
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = e.detail && e.detail.role ? e.detail.role : localStorage.getItem('userRole');
    
    if (isLoggedIn) {
        if (userRole === 'staff') {
            // Update UI for staff role without redirecting
            document.querySelectorAll('.staff-only').forEach(el => {
                el.style.display = 'block';
            });
            document.querySelectorAll('.member-only').forEach(el => {
                el.style.display = 'none';
            });
            
            // Update navbar - show only home page
            updateNavbarForStaff();
        } else {
            // Update UI for member role
            document.querySelectorAll('.staff-only').forEach(el => {
                el.style.display = 'none';
            });
            document.querySelectorAll('.member-only').forEach(el => {
                el.style.display = 'block';
            });
            
            // Restore all navbar items
            updateNavbarForMember();
        }
    }
});

// Helper functions for navbar
function updateNavbarForStaff() {
    // Use the role manager to update the navigation if available
    if (window.roleManager) {
        window.roleManager.updateNavigationForStaff();
    } else {
        // Fallback if roleManager is not available
        console.log('Using local implementation for updateNavbarForStaff');
        // Hide all menu items except for "Trang Chủ" (Home)
        const navItems = document.querySelectorAll('ul.navbar-nav .nav-item');
        
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            if (link) {
                // Check if this is the home page link
                if (link.href.includes('index.html') || link.textContent.includes('Trang Chủ')) {
                    // Show only the home page link
                    item.style.display = 'block';
                } else {
                    // Hide all other links
                    item.style.display = 'none';
                }
            }
        });
    }
}

function updateNavbarForMember() {
    // Use the role manager to update the navigation if available
    if (window.roleManager) {
        window.roleManager.updateNavigationForMember();
    } else {
        // Fallback if roleManager is not available
        console.log('Using local implementation for updateNavbarForMember');
        // Show all menu items again
        const navItems = document.querySelectorAll('ul.navbar-nav .nav-item');
        navItems.forEach(item => {
            item.style.display = 'block';
        });
    }
}
