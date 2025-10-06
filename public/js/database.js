// Database Class - Supports both localStorage (demo) and API (production)
class Database {
    constructor() {
        this.isConnected = false;
        this.storageKey = 'codoncraft_data';
        this.apiBaseUrl = 'http://localhost:3000/api';
        this.useAPI = false; // Set to true when server is running
        this.initStorage();
    }

    initStorage() {
        // Initialize localStorage with default data if empty
        if (!localStorage.getItem(this.storageKey)) {
            const defaultData = {
                users: [
                    {
                        _id: 'user_1',
                        username: 'Admin',
                        role: 'Administrator',
                        createdAt: new Date().toISOString()
                    }
                ],
                reports: []
            };
            localStorage.setItem(this.storageKey, JSON.stringify(defaultData));
        }
        this.isConnected = true;
        console.log('✅ Connected to local storage successfully!');
        console.log('Database: Local Storage (Demo Mode)');
        console.log('💡 To use MongoDB, start the server: npm start');
    }

    async connect() {
        // Try to connect to API first, fallback to localStorage
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            if (response.ok) {
                this.useAPI = true;
                this.isConnected = true;
                console.log('✅ Connected to MongoDB API successfully!');
                console.log('Database: MongoDB (Production Mode)');
                return true;
            }
        } catch (error) {
            console.log('⚠️ API not available, using localStorage');
        }

        // Fallback to localStorage
        this.useAPI = false;
        this.isConnected = true;
        return true;
    }

    getData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : { users: [], reports: [] };
    }

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async getUsers() {
        if (!this.isConnected) return [];
        try {
            if (this.useAPI) {
                const response = await fetch(`${this.apiBaseUrl}/users`);
                return await response.json();
            } else {
                const data = this.getData();
                return data.users || [];
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    async addUser(userData) {
        if (!this.isConnected) return null;
        try {
            if (this.useAPI) {
                const response = await fetch(`${this.apiBaseUrl}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                const result = await response.json();
                return result._id;
            } else {
                const data = this.getData();
                const newUser = {
                    _id: this.generateId(),
                    ...userData,
                    createdAt: new Date().toISOString()
                };
                data.users.push(newUser);
                this.saveData(data);
                return newUser._id;
            }
        } catch (error) {
            console.error('Error adding user:', error);
            return null;
        }
    }

    async deleteUser(userId) {
        if (!this.isConnected) return false;
        try {
            if (this.useAPI) {
                const response = await fetch(`${this.apiBaseUrl}/users/${userId}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                return result.success;
            } else {
                const data = this.getData();
                const initialLength = data.users.length;
                data.users = data.users.filter(user => user._id !== userId);
                this.saveData(data);
                return data.users.length < initialLength;
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            return false;
        }
    }

    async getReports() {
        if (!this.isConnected) return [];
        try {
            if (this.useAPI) {
                const response = await fetch(`${this.apiBaseUrl}/reports`);
                return await response.json();
            } else {
                const data = this.getData();
                const reports = data.reports || [];
                // Sort by creation date (newest first) and limit to 50
                return reports
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 50);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            return [];
        }
    }

    async addReport(reportData) {
        if (!this.isConnected) return null;
        try {
            if (this.useAPI) {
                const response = await fetch(`${this.apiBaseUrl}/reports`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reportData)
                });
                const result = await response.json();
                return result._id;
            } else {
                const data = this.getData();
                const newReport = {
                    _id: this.generateId(),
                    ...reportData,
                    createdAt: new Date().toISOString()
                };
                data.reports.push(newReport);
                this.saveData(data);
                return newReport._id;
            }
        } catch (error) {
            console.error('Error adding report:', error);
            return null;
        }
    }

    async disconnect() {
        // No need to disconnect from localStorage
        this.isConnected = false;
    }
}

// Global database instance
window.db = new Database();
const db = window.db;

// Initialize connection when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await db.connect();
    // Load initial data
    if (typeof loadDashboardData === 'function') {
        loadDashboardData();
    }
});
