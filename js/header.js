// Header functionality for two-part design - No animations

class HeaderManager {
    constructor() {
        this.currentLang = 'vi'; // Default Vietnamese
        this.isLoggedIn = false;
        this.userInfo = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Load saved settings first to prevent flickering
        this.loadSavedSettings();
        this.setupLanguageToggle();
        this.setupAuthButtons();
        this.preloadPages();
        this.isInitialized = true;
    }

    preloadPages() {
        // Preload common pages for faster navigation
        const pagesToPreload = ['index.html', 'donate.html', 'lookup.html', 'faq.html'];
        
        pagesToPreload.forEach(page => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = page;
            document.head.appendChild(link);
        });
    }

    setupLanguageToggle() {
        const languageToggle = document.querySelector('.language-toggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleLanguage();
            });
        }
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'vi' ? 'en' : 'vi';
        this.updateLanguageDisplay();
        this.updatePageContent();
        this.saveLanguagePreference();
    }

    updateLanguageDisplay() {
        const currentLangEl = document.querySelector('.current-lang');
        const alternateLangEl = document.querySelector('.alternate-lang');
        
        if (currentLangEl && alternateLangEl) {
            if (this.currentLang === 'vi') {
                currentLangEl.textContent = 'VN';
                alternateLangEl.textContent = 'EN';
            } else {
                currentLangEl.textContent = 'EN';
                alternateLangEl.textContent = 'VN';
            }
        }
    }

    updatePageContent() {
        const translations = {
            vi: {
                login: 'Đăng nhập',
                logout: 'Đăng Xuất',
                hello: 'Xin chào'
            },
            en: {
                login: 'Login',
                logout: 'Logout',
                hello: 'Hello'
            }
        };

        const trans = translations[this.currentLang];
        
        // Update login button text
        const authTextEl = document.querySelector('.auth-text');
        if (authTextEl) {
            authTextEl.textContent = trans.login;
        }

        // Update logout button text
        const logoutTextEl = document.querySelector('.logout-text');
        if (logoutTextEl) {
            logoutTextEl.textContent = trans.logout;
        }

        // Update hello text
        const helloTextEl = document.querySelector('.hello-text');
        if (helloTextEl) {
            helloTextEl.textContent = trans.hello;
        }

        // Update document language
        document.documentElement.lang = this.currentLang === 'vi' ? 'vi' : 'en';
    }

    setupAuthButtons() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.redirectToLogin();
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    redirectToLogin() {
        window.location.href = 'login.html';
    }

    login(userData) {
        this.isLoggedIn = true;
        this.userInfo = userData || { name: 'Huy' }; // Default name if none provided
        this.updateAuthDisplay();
        this.saveAuthState();
    }

    logout() {
        this.isLoggedIn = false;
        this.userInfo = null;
        this.updateAuthDisplay();
        this.clearAuthState();
        
        const translations = {
            vi: 'Đã đăng xuất thành công!',
            en: 'Successfully logged out!'
        };
        
        alert(translations[this.currentLang]);
    }

    updateAuthDisplay() {
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        const userNameEl = document.querySelector('.user-name');
        
        if (this.isLoggedIn && this.userInfo) {
            // Show user info, hide login button
            if (loginBtn) loginBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            
            // Update user name
            if (userNameEl && this.userInfo.name) {
                userNameEl.textContent = this.userInfo.name;
            }
        } else {
            // Show login button, hide user info
            if (loginBtn) loginBtn.style.display = 'block';
            if (userInfo) userInfo.style.display = 'none';
        }
    }

    saveLanguagePreference() {
        localStorage.setItem('preferredLanguage', this.currentLang);
        localStorage.setItem('langUpdateTime', Date.now().toString());
    }

    saveAuthState() {
        localStorage.setItem('isLoggedIn', this.isLoggedIn.toString());
        if (this.userInfo) {
            localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        }
        localStorage.setItem('authUpdateTime', Date.now().toString());
    }

    clearAuthState() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('authUpdateTime');
    }

    loadSavedSettings() {
        // Load language preference IMMEDIATELY to prevent flicker
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
            this.currentLang = savedLang;
        }

        // Load auth state IMMEDIATELY
        const savedLoginState = localStorage.getItem('isLoggedIn');
        const savedUserInfo = localStorage.getItem('userInfo');
        
        if (savedLoginState === 'true') {
            this.isLoggedIn = true;
            if (savedUserInfo) {
                try {
                    this.userInfo = JSON.parse(savedUserInfo);
                } catch (e) {
                    this.userInfo = { name: 'Huy' }; // Fallback
                }
            } else {
                this.userInfo = { name: 'Huy' }; // Default name
            }
        }

        // Apply settings immediately (before DOM is fully ready)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.applySettings();
            });
        } else {
            this.applySettings();
        }
        
        // Restore scroll position if available
        const scrollPos = sessionStorage.getItem('scrollPosition');
        if (scrollPos) {
            window.scrollTo(0, parseInt(scrollPos));
            sessionStorage.removeItem('scrollPosition');
        }
    }

    applySettings() {
        this.updateLanguageDisplay();
        this.updatePageContent();
        this.updateAuthDisplay();
    }

    // Public methods for external use
    setLanguage(lang) {
        if (lang === 'vi' || lang === 'en') {
            this.currentLang = lang;
            this.updateLanguageDisplay();
            this.updatePageContent();
            this.saveLanguagePreference();
        }
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    setUserLoggedIn(userData) {
        this.login(userData);
    }

    setUserLoggedOut() {
        this.logout();
    }

    isUserLoggedIn() {
        return this.isLoggedIn;
    }

    // Method to simulate login for testing
    simulateLogin(name = 'Huy') {
        this.login({ name: name });
    }
}

// Initialize IMMEDIATELY when script loads (before DOMContentLoaded)
if (typeof window !== 'undefined') {
    // Pre-initialize to load settings from localStorage immediately
    window.headerManager = new HeaderManager();
}

// Additional initialization when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // If headerManager wasn't created yet, create it now
    if (!window.headerManager) {
        window.headerManager = new HeaderManager();
    } else if (!window.headerManager.isInitialized) {
        // Re-initialize if needed
        window.headerManager.init();
    }
    
    // For testing - simulate login after 2 seconds (remove this in production)
    // setTimeout(() => {
    //     window.headerManager.simulateLogin('Huy');
    // }, 2000);
}); 