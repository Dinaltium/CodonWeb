// Authentication System for CodonCraft
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.storageKey = 'codoncraft_auth';
        this.init();
    }

    init() {
        // Check if user is already logged in
        this.checkExistingSession();

        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Register modal
        document.getElementById('registerLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.openRegisterModal();
        });

        document.getElementById('closeRegister').addEventListener('click', () => {
            this.closeRegisterModal();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('registerModal');
            if (e.target === modal) {
                this.closeRegisterModal();
            }
        });
    }

    checkExistingSession() {
        const authData = localStorage.getItem(this.storageKey);
        if (authData) {
            try {
                const user = JSON.parse(authData);
                if (user && user.username && this.isValidSession(user)) {
                    this.currentUser = user;
                    this.isLoggedIn = true;
                    this.redirectToDashboard();
                }
            } catch (error) {
                console.error('Error parsing auth data:', error);
                this.logout();
            }
        }
    }

    isValidSession(user) {
        // Check if session is not expired (24 hours)
        const now = new Date().getTime();
        const sessionTime = user.sessionTime || 0;
        const twentyFourHours = 24 * 60 * 60 * 1000;

        return (now - sessionTime) < twentyFourHours;
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        if (!username || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        this.setLoading(true, 'loginBtn');

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check credentials
            const user = await this.authenticateUser(username, password);

            if (user) {
                this.login(user, rememberMe);
                this.showSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1000);
            } else {
                this.showError('Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed. Please try again.');
        } finally {
            this.setLoading(false, 'loginBtn');
        }
    }

    async handleRegister() {
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const role = document.getElementById('regRole').value;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            this.showRegisterError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            this.showRegisterError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showRegisterError('Password must be at least 6 characters');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showRegisterError('Please enter a valid email address');
            return;
        }

        this.setLoading(true, 'registerBtn');

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check if user already exists
            const existingUser = await this.findUserByUsername(username);
            if (existingUser) {
                this.showRegisterError('Username already exists');
                return;
            }

            // Create new user
            const newUser = {
                username,
                email,
                role,
                password: this.hashPassword(password) // In real app, hash on server
            };

            await this.createUser(newUser);
            this.closeRegisterModal();
            this.showSuccess('Account created successfully! Please log in.');

            // Clear register form
            document.getElementById('registerForm').reset();

        } catch (error) {
            console.error('Registration error:', error);
            this.showRegisterError('Registration failed. Please try again.');
        } finally {
            this.setLoading(false, 'registerBtn');
        }
    }

    async authenticateUser(username, password) {
        // Try API first
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                return await response.json();
            } else if (response.status === 401) {
                return null; // Invalid credentials
            }
        } catch (error) {
            console.log('API not available, using localStorage');
        }

        // Fallback to localStorage
        const users = await this.getAllUsers();
        const user = users.find(u => u.username === username);

        if (user && this.verifyPassword(password, user.password)) {
            return {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            };
        }

        return null;
    }

    async getAllUsers() {
        // Try API first, fallback to localStorage
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.log('API not available, using localStorage');
        }

        // Fallback to localStorage
        const data = localStorage.getItem('codoncraft_data');
        return data ? JSON.parse(data).users || [] : [];
    }

    async createUser(userData) {
        // Try API first, fallback to localStorage
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.log('API not available, using localStorage');
        }

        // Fallback to localStorage
        const data = JSON.parse(localStorage.getItem('codoncraft_data') || '{"users": [], "reports": []}');
        const newUser = {
            _id: this.generateId(),
            ...userData,
            createdAt: new Date().toISOString()
        };
        data.users.push(newUser);
        localStorage.setItem('codoncraft_data', JSON.stringify(data));
        return newUser;
    }

    async findUserByUsername(username) {
        const users = await this.getAllUsers();
        return users.find(u => u.username === username);
    }


    login(user, rememberMe = false) {
        this.currentUser = user;
        this.isLoggedIn = true;

        const sessionData = {
            ...user,
            sessionTime: new Date().getTime(),
            rememberMe
        };

        localStorage.setItem(this.storageKey, JSON.stringify(sessionData));
    }

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        localStorage.removeItem(this.storageKey);
        window.location.href = '/login.html';
    }

    redirectToDashboard() {
        window.location.href = '/dashboard.html';
    }

    openRegisterModal() {
        document.getElementById('registerModal').style.display = 'block';
    }

    closeRegisterModal() {
        document.getElementById('registerModal').style.display = 'none';
        document.getElementById('registerForm').reset();
        this.hideRegisterError();
    }

    setLoading(loading, buttonId) {
        const button = document.getElementById(buttonId);
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    showSuccess(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.className = 'success-message';
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
            errorDiv.className = 'error-message';
        }, 3000);
    }

    showRegisterError(message) {
        const errorDiv = document.getElementById('registerErrorMessage');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    hideRegisterError() {
        document.getElementById('registerErrorMessage').style.display = 'none';
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    hashPassword(password) {
        // Simple hash for demo - in production, use proper hashing
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize authentication when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});
