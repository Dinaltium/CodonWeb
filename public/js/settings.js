// Database connection is available globally from database.js
async function initializeDatabase() {
    console.log('Checking for global db object...');
    // Wait for global db to be available
    if (typeof window.db === 'undefined') {
        console.log('Global db not found, waiting...');
        await new Promise(resolve => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max wait
            const checkDb = () => {
                attempts++;
                if (typeof window.db !== 'undefined') {
                    console.log('Global db found after', attempts, 'attempts');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.error('Global db not found after maximum attempts');
                    resolve(); // Continue anyway
                } else {
                    setTimeout(checkDb, 100);
                }
            };
            checkDb();
        });
    } else {
        console.log('Global db already available');
    }

    if (typeof window.db === 'undefined') {
        throw new Error('Database connection not available');
    }

    return window.db;
}

function loadSettingsPage() {
    const page = document.getElementById('settingsPage');
    // Always refresh Users tab when navigating to Settings so the table doesn't stay stale
    if (page.innerHTML) {
        const activeTab = document.querySelector('.settings-tab.active')?.getAttribute('data-tab');
        if (activeTab === 'users') {
            loadUsers();
        }
        return;
    }

    page.innerHTML = `
        <div class="page-header">
            <h1>Settings</h1>
            <p class="subtitle">Manage users and system settings</p>
        </div>
        
        <div class="card">
            <div style="display: flex; gap: 10px; border-bottom: 1px solid #e5e5e5; margin-bottom: 24px;">
                <button class="settings-tab active" data-tab="users" onclick="switchTab('users')">Users</button>
                <button class="settings-tab" data-tab="basic" onclick="switchTab('basic')">Basic</button>
                <button class="settings-tab" data-tab="advanced" onclick="switchTab('advanced')">Advanced</button>
            </div>
            
            <div id="usersTab" class="tab-content active">
                <h2>User Management</h2>
                <p style="color: #6b7280; margin-bottom: 24px;">Add and manage users who can access the bioinformatics platform.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
                    <h3 style="margin-bottom: 16px;">Add New User</h3>
                    <form id="addUserForm" onsubmit="event.preventDefault(); addUser();">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div class="form-group">
                                <label for="userName">Username *</label>
                                <input type="text" id="userName" placeholder="Enter username" required>
                            </div>
                            <div class="form-group">
                                <label for="userEmail">Email *</label>
                                <input type="email" id="userEmail" placeholder="Enter email address" required>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div class="form-group">
                                <label for="userPassword">Password *</label>
                                <input type="password" id="userPassword" placeholder="Enter password" required>
                            </div>
                            <div class="form-group">
                                <label for="userRole">Role *</label>
                                <select id="userRole" required>
                                    <option value="User">User</option>
                                    <option value="Researcher">Researcher</option>
                                    <option value="Administrator">Administrator</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label for="userDescription">Description</label>
                            <input type="text" id="userDescription" placeholder="Optional description">
                        </div>
                        <button type="submit" class="btn btn-primary" id="addUserBtn">
                            <span class="btn-text">Add User</span>
                            <span class="btn-loader" style="display: none;">Adding...</span>
                        </button>
                    </form>
                    <div id="successMessage" style="margin-top: 12px;"></div>
                    <div id="errorMessage" style="margin-top: 12px;"></div>
                </div>
                
                <div id="usersList"></div>
            </div>
            
            <div id="basicTab" class="tab-content">
                <h2>Basic Settings</h2>
                <p style="color: #6b7280; margin-bottom: 24px;">Configure basic platform settings.</p>
                
                <div style="display: grid; gap: 20px;">
                    <div class="form-group">
                        <label>Platform Name</label>
                        <input type="text" value="Bioinformatics Platform" readonly>
                    </div>
                    <div class="form-group">
                        <label>Version</label>
                        <input type="text" value="1.0.0" readonly>
                    </div>
                    <div class="form-group">
                        <label>Database</label>
                        <input type="text" value="MongoDB (Port 27018)" readonly>
                    </div>
                </div>
            </div>
            
            <div id="advancedTab" class="tab-content">
                <h2>Advanced Settings</h2>
                <p style="color: #6b7280; margin-bottom: 24px;">Advanced configuration options.</p>
                
                <div style="display: grid; gap: 20px;">
                    <div class="form-group">
                        <label>MongoDB Connection</label>
                        <input type="text" value="mongodb://localhost:27018/bioinformatics_db" readonly>
                    </div>
                    <div class="form-group">
                        <label>Data Directory</label>
                        <input type="text" value="C:\\data\\bioinformatics_db" readonly>
                    </div>
                    <div class="form-group">
                        <label>Log Level</label>
                        <select>
                            <option value="info">Info</option>
                            <option value="debug">Debug</option>
                            <option value="error">Error</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadUsers();
}

function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.settings-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');

    if (tabName === 'users') {
        loadUsers();
    }
}

async function loadUsers() {
    const container = document.getElementById('usersList');
    if (!container) {
        console.error('usersList container not found');
        return;
    }

    try {
        console.log('Loading users...');
        await initializeDatabase();
        // Ensure backend connection is resolved before first fetch
        if (typeof window.db.connect === 'function') {
            try { await window.db.connect(); } catch (_) { }
        }
        const users = await window.db.getUsers();
        console.log('Users loaded:', users);

        if (users.length === 0) {
            container.innerHTML = '<div class="text-center" style="padding: 40px; color: #6b7280;">No users found. Create your first user above.</div>';
            return;
        }

        let html = `
            <h3 style="margin-bottom: 16px;">Current Users (${users.length})</h3>
            <div style="overflow-x: auto;">
                <table class="table" style="width: 100%; min-width: 600px;">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        for (let user of users) {
            const date = new Date(user.createdAt).toLocaleDateString();
            const roleColor = user.role === 'Administrator' ? '#dbeafe' :
                user.role === 'Researcher' ? '#d1fae5' : '#f3f4f6';
            const textColor = user.role === 'Administrator' ? '#1e40af' :
                user.role === 'Researcher' ? '#059669' : '#374151';

            html += `
                <tr>
                    <td style="font-weight: 500;">${user.username || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>
                        <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; background: ${roleColor}; color: ${textColor};">
                            ${user.role || 'User'}
                        </span>
                    </td>
                    <td style="color: #6b7280; font-size: 14px;">${date}</td>
                    <td>
                        <button class="btn btn-secondary" onclick="deleteUser('${user._id}')" style="padding: 6px 12px; font-size: 12px; background: #dc2626; color: white; border: none;">Delete</button>
                    </td>
                </tr>
            `;
        }

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = '<div class="text-center" style="padding: 40px; color: #dc2626;">Error loading users: ' + error.message + '</div>';
    }
}

async function addUser() {
    const username = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    const description = document.getElementById('userDescription').value.trim();

    // Validation
    if (!username || !email || !password) {
        showError('Please fill in all required fields.');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters long.');
        return;
    }

    if (!isValidEmail(email)) {
        showError('Please enter a valid email address.');
        return;
    }

    // Set loading state
    setLoading(true, 'addUserBtn');

    try {
        // Initialize database connection
        console.log('Initializing database connection...');
        await initializeDatabase();
        console.log('Database initialized, db object:', db);

        // Hash password (simple hash for demo - in production use proper hashing)
        const hashedPassword = hashPassword(password);

        const userData = {
            username,
            email,
            password: hashedPassword,
            role,
            description
        };

        console.log('Creating user with data:', userData);
        const result = await window.db.addUser(userData);
        console.log('User creation result:', result);

        if (result) {
            // Clear form
            document.getElementById('userName').value = '';
            document.getElementById('userEmail').value = '';
            document.getElementById('userPassword').value = '';
            document.getElementById('userDescription').value = '';

            showSuccess('✅ User added successfully! They can now login with these credentials.');

            // Reload users list
            try {
                await loadUsers();
            } catch (loadError) {
                console.error('Error reloading users:', loadError);
            }
        } else {
            showError('Failed to create user. Please try again.');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        if (error.message && error.message.includes('already exists')) {
            showError('Username or email already exists. Please choose different credentials.');
        } else {
            showError('Error adding user: ' + (error.message || 'Unknown error'));
        }
    } finally {
        setLoading(false, 'addUserBtn');
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        await initializeDatabase();
        const result = await window.db.deleteUser(id);

        if (result) {
            showSuccess('✅ User deleted successfully!');
            try {
                await loadUsers();
            } catch (loadError) {
                console.error('Error reloading users:', loadError);
            }
        } else {
            showError('Failed to delete user. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Error deleting user: ' + (error.message || 'Unknown error'));
    }
}

// Helper functions
function setLoading(loading, buttonId) {
    console.log(`Setting loading state: ${loading} for button: ${buttonId}`);
    const button = document.getElementById(buttonId);
    if (!button) {
        console.error(`Button with ID ${buttonId} not found`);
        return;
    }

    if (loading) {
        console.log('Setting loading state to true');
        button.classList.add('loading');
        button.disabled = true;
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline';
    } else {
        console.log('Setting loading state to false');
        button.classList.remove('loading');
        button.disabled = false;
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    const errorDiv = document.getElementById('errorMessage');

    if (successDiv) {
        successDiv.innerHTML = `<div class="status status-success">${message}</div>`;
        successDiv.style.display = 'block';
    }

    if (errorDiv) {
        errorDiv.style.display = 'none';
    }

    setTimeout(() => {
        if (successDiv) {
            successDiv.innerHTML = '';
            successDiv.style.display = 'none';
        }
    }, 5000);
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');

    if (errorDiv) {
        errorDiv.innerHTML = `<div class="status status-error">${message}</div>`;
        errorDiv.style.display = 'block';
    }

    if (successDiv) {
        successDiv.style.display = 'none';
    }

    setTimeout(() => {
        if (errorDiv) {
            errorDiv.innerHTML = '';
            errorDiv.style.display = 'none';
        }
    }, 5000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function hashPassword(password) {
    // Simple hash for demo - in production, use proper hashing like bcrypt
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}