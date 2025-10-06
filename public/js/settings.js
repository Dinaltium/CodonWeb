function loadSettingsPage() {
    const page = document.getElementById('settingsPage');
    if (page.innerHTML) {
        if (document.querySelector('.settings-tab.active').getAttribute('data-tab') === 'accounts') {
            loadAccounts();
        }
        return;
    }
    
    page.innerHTML = `
        <style>
            .settings-container {
                max-width: 1200px;
            }
            
            .settings-card {
                background: white;
                border-radius: 12px;
                padding: 25px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .settings-tabs {
                display: flex;
                gap: 10px;
                border-bottom: 2px solid #e0e0e0;
                margin-bottom: 25px;
            }
            
            .settings-tab {
                padding: 12px 24px;
                background: none;
                border: none;
                color: #666;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                transition: all 0.2s;
            }
            
            .settings-tab:hover {
                color: #667eea;
            }
            
            .settings-tab.active {
                color: #667eea;
                border-bottom-color: #667eea;
            }
            
            .tab-content {
                display: none;
            }
            
            .tab-content.active {
                display: block;
                animation: fadeIn 0.3s;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: #555;
                font-weight: 500;
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 10px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 14px;
            }
            
            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #667eea;
            }
            
            .settings-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .settings-btn:hover {
                transform: translateY(-2px);
            }
            
            .settings-btn.secondary {
                background: linear-gradient(135deg, #868f96 0%, #596164 100%);
            }
            
            .accounts-list {
                margin-top: 30px;
            }
            
            .account-item {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .account-info {
                flex: 1;
            }
            
            .account-name {
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
            }
            
            .account-details {
                font-size: 14px;
                color: #666;
            }
            
            .account-actions {
                display: flex;
                gap: 10px;
            }
            
            .delete-btn {
                background: #dc3545;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .delete-btn:hover {
                background: #c82333;
            }
            
            .no-accounts {
                text-align: center;
                padding: 40px;
                color: #999;
            }
            
            .success-message {
                background: #d4edda;
                color: #155724;
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 15px;
            }
        </style>
        
        <div class="settings-container">
            <div class="page-header">
                <h1>⚙️ Settings</h1>
                <p class="subtitle">Manage your platform preferences and accounts</p>
            </div>
            
            <div class="settings-card">
                <div class="settings-tabs">
                    <button class="settings-tab active" data-tab="basic" onclick="switchSettingsTab('basic')">Basic</button>
                    <button class="settings-tab" data-tab="advanced" onclick="switchSettingsTab('advanced')">Advanced</button>
                    <button class="settings-tab" data-tab="accounts" onclick="switchSettingsTab('accounts')">Accounts</button>
                    <button class="settings-tab" data-tab="appearance" onclick="switchSettingsTab('appearance')">Appearance</button>
                </div>
                
                <div id="basicTab" class="tab-content active">
                    <h2>Basic Settings</h2>
                    <div class="form-group">
                        <label>Email Notifications</label>
                        <select>
                            <option>Enabled</option>
                            <option>Disabled</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Language</label>
                        <select>
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                        </select>
                    </div>
                    <button class="settings-btn">Save Changes</button>
                </div>
                
                <div id="advancedTab" class="tab-content">
                    <h2>Advanced Settings</h2>
                    <div class="form-group">
                        <label>Analysis Depth</label>
                        <select>
                            <option>Standard</option>
                            <option>Deep</option>
                            <option>Custom</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Auto-save Reports</label>
                        <select>
                            <option>Enabled</option>
                            <option>Disabled</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>API Access</label>
                        <input type="text" value="api_key_placeholder_" readonly>
                    </div>
                    <button class="settings-btn">Save Changes</button>
                </div>
                
                <div id="accountsTab" class="tab-content">
                    <h2>Account Management</h2>
                    <div id="successMessage"></div>
                    
                    <h3 style="margin-bottom: 15px;">Create New Account</h3>
                    <div class="form-group">
                        <label>Account Name</label>
                        <input type="text" id="accountName" placeholder="Enter account name">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="accountEmail" placeholder="Enter email address">
                    </div>
                    <div class="form-group">
                        <label>Account Type</label>
                        <select id="accountType">
                            <option value="user">User</option>
                            <option value="admin">Administrator</option>
                            <option value="researcher">Researcher</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="accountDesc" placeholder="Optional description" rows="3"></textarea>
                    </div>
                    <button class="settings-btn" onclick="createAccount()">Create Account</button>
                    <button class="settings-btn secondary" onclick="importAccounts()">Import Accounts</button>
                    
                    <div class="accounts-list">
                        <h3 style="margin-bottom: 15px;">Existing Accounts</h3>
                        <div id="accountsList"></div>
                    </div>
                </div>
                
                <div id="appearanceTab" class="tab-content">
                    <h2>Appearance Settings</h2>
                    <div class="form-group">
                        <label>Theme</label>
                        <select>
                            <option>Light</option>
                            <option>Dark</option>
                            <option>Auto</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Color Scheme</label>
                        <select>
                            <option>Purple (Default)</option>
                            <option>Blue</option>
                            <option>Green</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Font Size</label>
                        <select>
                            <option>Small</option>
                            <option>Medium</option>
                            <option>Large</option>
                        </select>
                    </div>
                    <button class="settings-btn">Save Changes</button>
                </div>
            </div>
        </div>
    `;
    
    loadAccounts();
}

function switchSettingsTab(tabName) {
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    if (tabName === 'accounts') {
        loadAccounts();
    }
}

async function loadAccounts() {
    const container = document.getElementById('accountsList');
    if (!container) return;
    
    try {
        const response = await fetch('/api/accounts');
        const accounts = await response.json();
        
        if (accounts.length === 0) {
            container.innerHTML = '<div class="no-accounts">No accounts found. Create your first account above.</div>';
            return;
        }
        
        let html = '';
        for (let account of accounts) {
            html += `
                <div class="account-item">
                    <div class="account-info">
                        <div class="account-name">${account.name}</div>
                        <div class="account-details">
                            ${account.email} • ${account.type} • Created by ${account.createdBy}
                        </div>
                    </div>
                    <div class="account-actions">
                        <button class="delete-btn" onclick="deleteAccount('${account._id}')">Delete</button>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<div class="no-accounts">Error loading accounts.</div>';
    }
}

async function createAccount() {
    const name = document.getElementById('accountName').value;
    const email = document.getElementById('accountEmail').value;
    const type = document.getElementById('accountType').value;
    const description = document.getElementById('accountDesc').value;
    
    if (!name || !email) {
        alert('Please fill in account name and email.');
        return;
    }
    
    try {
        const response = await fetch('/api/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, type, description })
        });
        
        if (response.ok) {
            document.getElementById('accountName').value = '';
            document.getElementById('accountEmail').value = '';
            document.getElementById('accountDesc').value = '';
            
            const successMsg = document.getElementById('successMessage');
            successMsg.innerHTML = '<div class="success-message">Account created successfully!</div>';
            setTimeout(() => { successMsg.innerHTML = ''; }, 3000);
            
            loadAccounts();
            loadDashboardData();
        }
    } catch (error) {
        alert('Error creating account.');
    }
}

async function deleteAccount(id) {
    if (!confirm('Are you sure you want to delete this account?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/accounts/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadAccounts();
            loadDashboardData();
        }
    } catch (error) {
        alert('Error deleting account.');
    }
}

function importAccounts() {
    alert('Import functionality: You can upload a CSV file with account data.\n\nExpected format:\nname,email,type,description\nJohn Doe,john@example.com,user,Research team');
}
