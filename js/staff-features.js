// Staff-specific features for Blood Donation System

class StaffFeatures {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeStaffFeatures();
    }

    setupEventListeners() {
        // Listen for role changes
        document.addEventListener('roleToggled', (e) => {
            if (e.detail && e.detail.role) {
                if (e.detail.role === 'staff') {
                    this.enableStaffFeatures();
                } else {
                    this.disableStaffFeatures();
                }
            }
        });
    }

    initializeStaffFeatures() {
        // Check current role
        const userRole = localStorage.getItem('userRole') || 'member';
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        // Only enable if logged in as staff
        if (isLoggedIn && userRole === 'staff') {
            this.enableStaffFeatures();
        } else {
            this.disableStaffFeatures();
        }
    }    enableStaffFeatures() {
        // Add staff-specific UI elements
        this.addStaffNavItems();
        
        // Enable staff-only features
        document.querySelectorAll('.staff-feature').forEach(el => {
            el.classList.remove('d-none');
        });

        // Add staff badge to profile if on account page
        this.addStaffBadge();
        
        // Show only home page in navbar
        this.updateNavbarForStaff();
        
        console.log('Staff features enabled');
    }

    disableStaffFeatures() {
        // Remove staff-specific UI elements
        this.removeStaffNavItems();
        
        // Hide staff-only features
        document.querySelectorAll('.staff-feature').forEach(el => {
            el.classList.add('d-none');
        });

        // Remove staff badge from profile
        this.removeStaffBadge();
        
        // Restore all navbar items
        this.updateNavbarForMember();
        
        console.log('Staff features disabled');
    }addStaffNavItems() {
        // We don't add any staff navigation items anymore
        // This method is kept for future implementations
        console.log('Staff mode activated - home page only');
    }

    removeStaffNavItems() {
        // Remove staff-specific navigation items
        document.querySelectorAll('.staff-nav-item').forEach(el => {
            el.remove();
        });
    }    updateNavbarForStaff() {
        // Use the role manager to update the navigation
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
            
            // Add staff dashboard link as fallback
            this.addStaffDashboardNavItemFallback();
        }
    }

    addStaffDashboardNavItemFallback() {
        setTimeout(() => {
            const navbar = document.querySelector('ul.navbar-nav');
            if (!navbar) {
                console.log('StaffFeatures: Navbar not found, retrying...');
                setTimeout(() => this.addStaffDashboardNavItemFallback(), 100);
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
                    <i class="fas fa-tachometer-alt me-2"></i>
                    Bảng điều khiển
                </a>
            `;
            
            // Add after the home link
            const homeItem = navbar.querySelector('li:first-child');
            if (homeItem && homeItem.nextSibling) {
                navbar.insertBefore(staffDashboardItem, homeItem.nextSibling);
            } else {
                navbar.appendChild(staffDashboardItem);
            }
            
            console.log('StaffFeatures: Staff dashboard link added to navbar (fallback)');
        }, 50);
    }

    updateNavbarForMember() {
        // Use the role manager to update the navigation
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
            
            // Remove staff dashboard navigation item
            document.querySelectorAll('.staff-dashboard-nav-item').forEach(el => {
                el.remove();
            });
        }
    }

    addStaffBadge() {
        // Check if we're on account page
        if (window.location.href.includes('account.html')) {
            const profileHeader = document.querySelector('.profile-header');
            if (profileHeader && !document.querySelector('.staff-badge')) {
                const staffBadge = document.createElement('span');
                staffBadge.className = 'badge bg-danger staff-badge ms-2';
                staffBadge.innerText = 'Nhân viên';
                profileHeader.appendChild(staffBadge);
            }
        }
    }

    removeStaffBadge() {
        // Remove staff badge if exists
        document.querySelectorAll('.staff-badge').forEach(el => {
            el.remove();
        });
    }
}

// Initialize the staff features
document.addEventListener('DOMContentLoaded', function() {
    window.staffFeatures = new StaffFeatures();
});
