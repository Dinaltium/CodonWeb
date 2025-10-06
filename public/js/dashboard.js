let currentUser = null;

async function checkAuth() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) {
            window.location.href = '/';
            return;
        }
        currentUser = await response.json();
        updateUserProfile();
        loadDashboardData();
    } catch (error) {
        window.location.href = '/';
    }
}

function updateUserProfile() {
    if (currentUser) {
        const userProfile = document.getElementById('userProfile');
        const avatar = userProfile.querySelector('.user-avatar');
        const userName = userProfile.querySelector('.user-name');
        const userRole = userProfile.querySelector('.user-role');
        
        avatar.textContent = currentUser.username.charAt(0).toUpperCase();
        userName.textContent = currentUser.username;
        userRole.textContent = currentUser.role || 'User';
    }
}

async function loadDashboardData() {
    try {
        const [accountsRes, reportsRes] = await Promise.all([
            fetch('/api/accounts'),
            fetch('/api/reports')
        ]);
        
        const accounts = await accountsRes.json();
        const reports = await reportsRes.json();
        
        document.getElementById('totalAnalyses').textContent = reports.length;
        document.getElementById('recentReports').textContent = reports.length;
        document.getElementById('totalAccounts').textContent = accounts.length;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

document.getElementById('toggleBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');
        navigateToPage(page);
    });
});

function navigateToPage(pageName) {
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(`${pageName}Page`);
    targetPage.classList.add('active');
    
    if (pageName === 'sequence') {
        initSequencePage();
    } else if (pageName === 'reports') {
        loadReportsPage();
    } else if (pageName === 'settings') {
        loadSettingsPage();
    }
}

checkAuth();
