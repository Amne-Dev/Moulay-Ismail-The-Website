// Authentication utility functions
const Auth = {
    // API base URL
    apiUrl: window.location.origin + '/api',

    // Get token from localStorage
    getToken() {
        return localStorage.getItem('authToken');
    },

    // Set token in localStorage
    setToken(token) {
        localStorage.setItem('authToken', token);
    },

    // Remove token from localStorage
    removeToken() {
        localStorage.removeItem('authToken');
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    },

    // Make authenticated API request
    async request(url, options = {}) {
        const token = this.getToken();
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    // Login function
    async login(username, password) {
        try {
            const response = await this.request(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            this.setToken(response.token);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Logout function
    async logout() {
        try {
            await this.request(`${this.apiUrl}/auth/logout`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            this.removeToken();
            window.location.href = '/admin';
        }
    },

    // Verify token
    async verifyToken() {
        try {
            const response = await this.request(`${this.apiUrl}/auth/verify`);
            return response;
        } catch (error) {
            this.removeToken();
            throw error;
        }
    },

    // Show alert message
    showAlert(message, type = 'danger', containerId = 'alert-container') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                const alert = container.querySelector('.alert');
                if (alert) {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                }
            }, 5000);
        }
    }
};

// Login form handler (for admin.html)
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const spinner = document.getElementById('loginSpinner');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        // Show loading state
        spinner.classList.remove('d-none');
        submitBtn.disabled = true;

        try {
            await Auth.login(username, password);
            Auth.showAlert('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/admin/dashboard';
            }, 1000);
        } catch (error) {
            Auth.showAlert(error.message || 'Login failed. Please try again.');
        } finally {
            // Hide loading state
            spinner.classList.add('d-none');
            submitBtn.disabled = false;
        }
    });
}

// Check authentication on dashboard pages
if (window.location.pathname.includes('/admin/dashboard')) {
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            await Auth.verifyToken();
        } catch (error) {
            Auth.showAlert('Session expired. Please log in again.');
            setTimeout(() => {
                window.location.href = '/admin';
            }, 2000);
        }
    });
}

// Logout handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                Auth.logout();
            }
        });
    }
});

// Redirect if already authenticated (for admin.html)
if (window.location.pathname === '/admin' && Auth.isAuthenticated()) {
    Auth.verifyToken()
        .then(() => {
            window.location.href = '/admin/dashboard';
        })
        .catch(() => {
            // Token is invalid, stay on login page
        });
}