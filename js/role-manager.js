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
    }updateNavigationForStaff() {
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
        
        // Trigger a custom event so other components can respond
        const event = new CustomEvent('navbarUpdatedForStaff');
        document.dispatchEvent(event);
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
});

// Listen for header manager role changes
document.addEventListener('roleToggled', function(e) {
    if (window.roleManager && e.detail && e.detail.role) {
        window.roleManager.setRole(e.detail.role);
    }
});
