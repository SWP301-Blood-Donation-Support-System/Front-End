// Blood Donation Support System - Role Management JavaScript

class RoleManager {
    constructor() {
        this.currentRole = localStorage.getItem('userRole') || 'member'; // Default role
        this.init();
        
        // Make the instance globally available
        window.roleManager = this;
    }    init() {
        this.setupRoleBasedUI();
        
        // Listen for role change events
        document.addEventListener('roleChanged', (e) => {
            if (e.detail && e.detail.role) {
                this.currentRole = e.detail.role;
            }
            this.setupRoleBasedUI();
        });
        
        // Also listen for roleToggled event from header.js
        document.addEventListener('roleToggled', (e) => {
            if (e.detail && e.detail.role) {
                this.currentRole = e.detail.role;
            }
            this.setupRoleBasedUI();
        });
    }

    setupRoleBasedUI() {
        if (this.currentRole === 'staff') {
            this.setupStaffUI();
        } else {
            this.setupMemberUI();
        }
    }    setupStaffUI() {
        console.log('RoleManager: Setting up staff UI');
        // Hide/show elements based on staff role
        document.querySelectorAll('.staff-only').forEach(el => {
            el.style.display = 'block';
        });
        
        document.querySelectorAll('.member-only').forEach(el => {
            el.style.display = 'none';
        });

        // Add staff-specific navigation menu items
        this.updateNavigationForStaff();
        
        // Redirect to index.html when entering staff mode (not dashboard directly)
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn && !window.location.pathname.includes('index.html') && !window.location.pathname.includes('staff-dashboard.html')) {
            // Small delay to ensure the role change is processed
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        }
    }    setupMemberUI() {
        console.log('RoleManager: Setting up member UI');
        // Hide/show elements based on member role
        document.querySelectorAll('.staff-only').forEach(el => {
            el.style.display = 'none';
        });
        
        document.querySelectorAll('.member-only').forEach(el => {
            el.style.display = 'block';
        });

        // Restore standard navigation menu items
        this.updateNavigationForMember();
        
        // Redirect to index.html when switching back to member mode from staff dashboard
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn && window.location.pathname.includes('staff-dashboard.html')) {
            // Small delay to ensure the role change is processed
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        }
    }    updateNavigationForStaff() {
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
        
        // Add staff dashboard link to navbar
        this.addStaffDashboardNavItem();
        
        // Trigger a custom event so other components can respond
        const event = new CustomEvent('navbarUpdatedForStaff');
        document.dispatchEvent(event);
    }

    addStaffDashboardNavItem() {
        // Add small delay to ensure DOM is ready
        setTimeout(() => {
            const navbar = document.querySelector('ul.navbar-nav');
            if (!navbar) {
                console.log('RoleManager: Navbar not found, retrying...');
                // Retry after another delay
                setTimeout(() => this.addStaffDashboardNavItem(), 100);
                return;
            }
            
            // Remove existing staff dashboard link if any
            document.querySelectorAll('.staff-dashboard-nav-item').forEach(el => {
                el.remove();
            });
            
            // Create staff dashboard navigation item
            const staffDashboardItem = document.createElement('li');
            staffDashboardItem.className = 'nav-item me-4 staff-dashboard-nav-item';
            staffDashboardItem.innerHTML = `
                <a class="nav-link fs-6" href="staff-dashboard.html">
                    Dashboard
                </a>
            `;
            
            // Add after the home link
            const homeItem = navbar.querySelector('li:first-child');
            if (homeItem && homeItem.nextSibling) {
                navbar.insertBefore(staffDashboardItem, homeItem.nextSibling);
            } else {
                navbar.appendChild(staffDashboardItem);
            }
            
            // Set active state if currently on staff dashboard
            if (window.location.pathname.includes('staff-dashboard.html')) {
                // Remove active from home
                navbar.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                // Add active to staff dashboard
                staffDashboardItem.querySelector('.nav-link').classList.add('active');
            }
            
            console.log('RoleManager: Staff dashboard link added to navbar');
        }, 50);
    }

    updateNavigationForMember() {
        // Show all menu items again
        const navItems = document.querySelectorAll('ul.navbar-nav .nav-item');
        navItems.forEach(item => {
            item.style.display = 'block';
        });
        
        // Remove any staff-specific navigation items
        document.querySelectorAll('.staff-nav-item').forEach(el => {
            el.remove();
        });
        
        // Remove staff dashboard navigation item
        document.querySelectorAll('.staff-dashboard-nav-item').forEach(el => {
            el.remove();
        });
        
        // Trigger a custom event so other components can respond
        const event = new CustomEvent('navbarUpdatedForMember');
        document.dispatchEvent(event);
    }

    setRole(role) {
        if (role === 'staff' || role === 'member') {
            this.currentRole = role;
            localStorage.setItem('userRole', role);
            
            // Create a custom event to notify other components of the role change
            const event = new CustomEvent('roleChanged', { 
                detail: { role: this.currentRole } 
            });
            document.dispatchEvent(event);
            
            this.setupRoleBasedUI();
        }
    }    getCurrentRole() {
        return this.currentRole;
    }
}

// Initialize the role manager
document.addEventListener('DOMContentLoaded', function() {
    // If roleManager wasn't created yet, create it now
    if (!window.roleManager) {
        window.roleManager = new RoleManager();
    }
});

// Initialize role manager on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    window.roleManager = new RoleManager();
    
    // Force navigation update after a delay to ensure all elements are loaded
    setTimeout(() => {
        const userRole = localStorage.getItem('userRole');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (isLoggedIn && userRole === 'staff') {
            console.log('RoleManager: Forcing staff navigation update on page load');
            if (window.roleManager) {
                window.roleManager.updateNavigationForStaff();
            }
        }
    }, 200);
});

// Listen for header manager role changes
document.addEventListener('roleToggled', function(e) {
    if (window.roleManager && e.detail && e.detail.role) {
        window.roleManager.setRole(e.detail.role);
    }
});
