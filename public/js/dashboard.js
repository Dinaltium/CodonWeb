let currentUser = null;

// Check authentication on page load
function checkAuthentication() {
    const authData = localStorage.getItem('codoncraft_auth');
    if (!authData) {
        window.location.href = '/login.html';
        return false;
    }

    try {
        const user = JSON.parse(authData);
        if (!user || !user.username) {
            window.location.href = '/login.html';
            return false;
        }

        // Check if session is still valid
        const now = new Date().getTime();
        const sessionTime = user.sessionTime || 0;
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if ((now - sessionTime) > twentyFourHours) {
            localStorage.removeItem('codoncraft_auth');
            window.location.href = '/login.html';
            return false;
        }

        currentUser = user;
        return true;
    } catch (error) {
        console.error('Error parsing auth data:', error);
        window.location.href = '/login.html';
        return false;
    }
}

function updateUserProfile() {
    const userProfile = document.getElementById('userProfile');
    const avatar = userProfile.querySelector('.user-avatar');
    const userName = userProfile.querySelector('.user-name');
    const userRole = userProfile.querySelector('.user-role');

    avatar.textContent = currentUser.username.charAt(0).toUpperCase();
    userName.textContent = currentUser.username;
    userRole.textContent = currentUser.role || 'User';

    // Update modal user info
    const modalAvatar = document.querySelector('.user-modal-avatar');
    const modalName = document.querySelector('.user-modal-name');
    const modalEmail = document.querySelector('.user-modal-email');

    if (modalAvatar) modalAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
    if (modalName) modalName.textContent = currentUser.username;
    if (modalEmail) modalEmail.textContent = currentUser.email || 'No email provided';
}

async function loadDashboardData() {
    try {
        const users = await window.db.getUsers();
        const reports = await window.db.getReports();

        // Update main statistics
        document.getElementById('totalAnalyses').textContent = reports.length;

        // Calculate codon-specific statistics
        let totalCodons = 0;
        let totalGcContent = 0;
        let codonCounts = {};
        let stopCodons = 0;

        reports.forEach(report => {
            if (report.totalCodons) {
                totalCodons += report.totalCodons;
            }
            if (report.gcContent) {
                totalGcContent += parseFloat(report.gcContent);
            }
            if (report.sequence) {
                // Count codons in sequence
                const sequence = report.sequence.toUpperCase();
                for (let i = 0; i <= sequence.length - 3; i += 3) {
                    const codon = sequence.substr(i, 3);
                    if (CODON_TABLE && CODON_TABLE[codon]) {
                        codonCounts[codon] = (codonCounts[codon] || 0) + 1;
                        if (CODON_TABLE[codon] === 'STOP') {
                            stopCodons++;
                        }
                    }
                }
            }
        });

        document.getElementById('totalCodons').textContent = totalCodons;
        document.getElementById('avgGcContent').textContent = reports.length > 0 ?
            (totalGcContent / reports.length).toFixed(1) + '%' : '0%';

        // Load recent analyses
        loadRecentAnalyses(reports);

        // Load codon overview
        loadCodonOverview(codonCounts, stopCodons);

        // Load amino acid analysis
        loadAminoAcidAnalysis(codonCounts);

        // Load optimization insights
        loadOptimizationInsights(codonCounts, totalCodons);

        // Load codon heatmap
        loadCodonHeatmap(codonCounts);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function loadRecentAnalyses(reports) {
    const container = document.getElementById('recentAnalyses');

    if (reports.length === 0) {
        container.innerHTML = '<div class="no-data">No recent analyses found. Start by analyzing a DNA sequence!</div>';
        return;
    }

    const recentReports = reports.slice(0, 5); // Show last 5 analyses
    let html = '';

    recentReports.forEach(report => {
        const sequence = report.sequence || '';
        const preview = sequence.length > 50 ? sequence.substring(0, 50) + '...' : sequence;
        const date = new Date(report.createdAt).toLocaleDateString();

        html += `
            <div class="analysis-item">
                <div class="analysis-info">
                    <div class="analysis-sequence">${preview}</div>
                    <div class="analysis-stats">
                        <span>Length: ${report.sequenceLength || 0} bp</span>
                        <span>Codons: ${report.totalCodons || 0}</span>
                        <span>GC: ${report.gcContent || 0}%</span>
                        <span>Date: ${date}</span>
                    </div>
                </div>
                <div class="analysis-actions">
                    <button class="analysis-btn" onclick="viewAnalysis('${report._id}')">View</button>
                    <button class="analysis-btn" onclick="exportAnalysis('${report._id}')">Export</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function loadCodonOverview(codonCounts, stopCodons) {
    // Find most common codon
    let mostCommonCodon = '-';
    let maxCount = 0;
    for (const [codon, count] of Object.entries(codonCounts)) {
        if (count > maxCount) {
            maxCount = count;
            mostCommonCodon = codon;
        }
    }

    // Calculate codon diversity (number of different codons used)
    const codonDiversity = Object.keys(codonCounts).length;

    // Calculate codon bias index (Shannon entropy)
    const totalCodons = Object.values(codonCounts).reduce((sum, count) => sum + count, 0);
    let codonBiasIndex = 0;
    if (totalCodons > 0) {
        for (const count of Object.values(codonCounts)) {
            if (count > 0) {
                const frequency = count / totalCodons;
                codonBiasIndex -= frequency * Math.log2(frequency);
            }
        }
        codonBiasIndex = codonBiasIndex.toFixed(2);
    }

    // Update display
    document.getElementById('mostCommonCodon').textContent = mostCommonCodon;
    document.getElementById('codonDiversity').textContent = codonDiversity;
    document.getElementById('stopCodons').textContent = stopCodons;
    document.getElementById('codonBiasIndex').textContent = codonBiasIndex;

    // Create simple codon usage chart
    createCodonChart(codonCounts);
}

function createCodonChart(codonCounts) {
    const canvas = document.getElementById('codonChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const sortedCodons = Object.entries(codonCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10 codons

    if (sortedCodons.length === 0) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No codon data available', canvas.width / 2, canvas.height / 2);
        return;
    }

    const maxCount = Math.max(...sortedCodons.map(([_, count]) => count));
    const barWidth = canvas.width / sortedCodons.length;
    const maxBarHeight = canvas.height - 40;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bars
    sortedCodons.forEach(([codon, count], index) => {
        const barHeight = (count / maxCount) * maxBarHeight;
        const x = index * barWidth;
        const y = canvas.height - barHeight - 20;

        // Bar
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(x + 2, y, barWidth - 4, barHeight);

        // Codon label
        ctx.fillStyle = '#374151';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(codon, x + barWidth / 2, canvas.height - 5);

        // Count label
        ctx.fillStyle = '#6b7280';
        ctx.font = '8px Arial';
        ctx.fillText(count.toString(), x + barWidth / 2, y - 5);
    });
}

document.getElementById('toggleBtn').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');

    sidebar.classList.toggle('collapsed');

    // Update main content margin based on sidebar state
    if (sidebar.classList.contains('collapsed')) {
        mainContent.style.marginLeft = '80px';
    } else {
        mainContent.style.marginLeft = '280px';
    }
});

// Remove logout functionality since we're not using authentication

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');
        navigateToPage(page);
    });
});

function navigateToPage(pageName) {
    // Update URL without page reload
    const newUrl = `${window.location.pathname}#${pageName}`;
    window.history.pushState({ page: pageName }, '', newUrl);

    // Update UI
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

// Codon Tools Modal Functions
function openCodonTools() {
    document.getElementById('codonToolsModal').style.display = 'block';
}

function closeCodonTools() {
    document.getElementById('codonToolsModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('codonToolsModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Codon Tool Functions
function reverseComplement() {
    const sequence = prompt('Enter DNA sequence:');
    if (!sequence) return;

    const complement = sequence.toUpperCase()
        .replace(/A/g, 'T')
        .replace(/T/g, 'A')
        .replace(/C/g, 'G')
        .replace(/G/g, 'C');

    const reverse = complement.split('').reverse().join('');

    alert(`Reverse Complement:\n${reverse}`);
    closeCodonTools();
}

function codonOptimizer() {
    alert('Codon Optimizer: This feature will optimize codons for better expression. Coming soon!');
    closeCodonTools();
}

function gcCalculator() {
    const sequence = prompt('Enter DNA sequence:');
    if (!sequence) return;

    const cleanSeq = sequence.toUpperCase().replace(/[^ATCG]/g, '');
    const gcCount = (cleanSeq.match(/[GC]/g) || []).length;
    const gcContent = ((gcCount / cleanSeq.length) * 100).toFixed(2);

    alert(`GC Content: ${gcContent}%\nSequence Length: ${cleanSeq.length} bp`);
    closeCodonTools();
}

function orfFinder() {
    alert('ORF Finder: This feature will find open reading frames in DNA sequences. Coming soon!');
    closeCodonTools();
}

// Export Functions
function exportData() {
    const data = {
        timestamp: new Date().toISOString(),
        analyses: document.getElementById('totalAnalyses').textContent,
        codons: document.getElementById('totalCodons').textContent,
        gcContent: document.getElementById('avgGcContent').textContent
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codoncraft-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function viewAnalysis(reportId) {
    // Navigate to reports page and highlight specific analysis
    navigateToPage('reports');
    // Could add logic to highlight specific report
}

function exportAnalysis(reportId) {
    // Export specific analysis data
    alert(`Exporting analysis ${reportId}...`);
}

// Amino Acid Analysis Functions
function loadAminoAcidAnalysis(codonCounts) {
    const aaCounts = {};
    const totalCodons = Object.values(codonCounts).reduce((sum, count) => sum + count, 0);

    // Count amino acids
    for (const [codon, count] of Object.entries(codonCounts)) {
        if (CODON_TABLE && CODON_TABLE[codon]) {
            const aa = CODON_TABLE[codon];
            aaCounts[aa] = (aaCounts[aa] || 0) + count;
        }
    }

    // Find most abundant amino acid
    let mostAbundantAA = '-';
    let maxAACount = 0;
    for (const [aa, count] of Object.entries(aaCounts)) {
        if (count > maxAACount) {
            maxAACount = count;
            mostAbundantAA = aa;
        }
    }

    // Calculate AA diversity
    const aaDiversity = Object.keys(aaCounts).length;

    // Calculate hydrophobic and charged AAs
    const hydrophobicAAs = ['Phe', 'Leu', 'Ile', 'Met', 'Val', 'Pro', 'Ala', 'Trp'];
    const chargedAAs = ['Lys', 'Arg', 'Asp', 'Glu'];

    const hydrophobicCount = hydrophobicAAs.reduce((sum, aa) => sum + (aaCounts[aa] || 0), 0);
    const chargedCount = chargedAAs.reduce((sum, aa) => sum + (aaCounts[aa] || 0), 0);

    // Update display
    document.getElementById('mostAbundantAA').textContent = mostAbundantAA;
    document.getElementById('aaDiversity').textContent = aaDiversity;
    document.getElementById('hydrophobicAAs').textContent = totalCodons > 0 ?
        ((hydrophobicCount / totalCodons) * 100).toFixed(1) + '%' : '0%';
    document.getElementById('chargedAAs').textContent = totalCodons > 0 ?
        ((chargedCount / totalCodons) * 100).toFixed(1) + '%' : '0%';

    // Create amino acid chart
    createAminoAcidChart(aaCounts);
}

function createAminoAcidChart(aaCounts) {
    const canvas = document.getElementById('aminoAcidChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const sortedAAs = Object.entries(aaCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15); // Top 15 amino acids

    if (sortedAAs.length === 0) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No amino acid data available', canvas.width / 2, canvas.height / 2);
        return;
    }

    const maxCount = Math.max(...sortedAAs.map(([_, count]) => count));
    const barWidth = canvas.width / sortedAAs.length;
    const maxBarHeight = canvas.height - 60;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bars
    sortedAAs.forEach(([aa, count], index) => {
        const barHeight = (count / maxCount) * maxBarHeight;
        const x = index * barWidth;
        const y = canvas.height - barHeight - 30;

        // Bar with gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#1d4ed8');
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 2, y, barWidth - 4, barHeight);

        // AA label
        ctx.fillStyle = '#374151';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(aa, x + barWidth / 2, canvas.height - 10);

        // Count label
        ctx.fillStyle = '#6b7280';
        ctx.font = '8px Arial';
        ctx.fillText(count.toString(), x + barWidth / 2, y - 5);
    });
}

// Optimization Insights Functions
function loadOptimizationInsights(codonCounts, totalCodons) {
    if (totalCodons === 0) {
        document.getElementById('efficiencyScore').innerHTML = '<span class="score-value">-</span><span class="score-label">/100</span>';
        document.getElementById('optimizationRecommendations').innerHTML = '<p class="no-data">No data available for recommendations</p>';
        document.getElementById('rareCodons').textContent = '-';
        document.getElementById('preferredCodons').textContent = '-';
        return;
    }

    // Calculate efficiency score based on codon usage patterns
    const efficiencyScore = calculateEfficiencyScore(codonCounts, totalCodons);
    document.getElementById('efficiencyScore').innerHTML = `<span class="score-value">${efficiencyScore}</span><span class="score-label">/100</span>`;

    // Generate recommendations
    const recommendations = generateOptimizationRecommendations(codonCounts, totalCodons);
    displayRecommendations(recommendations);

    // Analyze codon patterns
    const patterns = analyzeCodonPatterns(codonCounts, totalCodons);
    document.getElementById('rareCodons').textContent = patterns.rareCodons;
    document.getElementById('preferredCodons').textContent = patterns.preferredCodons;
}

function calculateEfficiencyScore(codonCounts, totalCodons) {
    // Calculate score based on codon usage efficiency
    let score = 0;
    const totalPossibleCodons = 61; // 64 - 3 stop codons
    const usedCodons = Object.values(codonCounts).filter(count => count > 0).length;

    // Diversity score (0-40 points)
    const diversityScore = Math.min(40, (usedCodons / totalPossibleCodons) * 40);
    score += diversityScore;

    // Evenness score (0-30 points)
    const frequencies = Object.values(codonCounts).map(count => count / totalCodons);
    const shannonEntropy = -frequencies.reduce((sum, freq) => sum + (freq > 0 ? freq * Math.log2(freq) : 0), 0);
    const maxEntropy = Math.log2(usedCodons || 1);
    const evennessScore = usedCodons > 1 ? (shannonEntropy / maxEntropy) * 30 : 0;
    score += evennessScore;

    // Stop codon penalty (0-30 points)
    const stopCodonCount = (codonCounts['TAA'] || 0) + (codonCounts['TAG'] || 0) + (codonCounts['TGA'] || 0);
    const stopCodonPenalty = Math.min(30, (stopCodonCount / totalCodons) * 30);
    score += 30 - stopCodonPenalty;

    return Math.round(Math.max(0, Math.min(100, score)));
}

function generateOptimizationRecommendations(codonCounts, totalCodons) {
    const recommendations = [];

    // Check for rare codons
    const rareCodons = Object.entries(codonCounts)
        .filter(([codon, count]) => count > 0 && (count / totalCodons) < 0.01)
        .map(([codon, aa]) => ({ codon, aa }));

    if (rareCodons.length > 0) {
        recommendations.push(`Consider optimizing ${rareCodons.length} rare codons for better expression`);
    }

    // Check for overused codons
    const overusedCodons = Object.entries(codonCounts)
        .filter(([codon, count]) => (count / totalCodons) > 0.1)
        .map(([codon, aa]) => ({ codon, aa }));

    if (overusedCodons.length > 0) {
        recommendations.push(`Balance codon usage - ${overusedCodons.length} codons are overused`);
    }

    // Check for stop codons
    const stopCodonCount = (codonCounts['TAA'] || 0) + (codonCounts['TAG'] || 0) + (codonCounts['TGA'] || 0);
    if (stopCodonCount > totalCodons * 0.05) {
        recommendations.push('High number of stop codons detected - check for premature termination');
    }

    // Check for GC content
    const gcCodons = Object.entries(codonCounts)
        .filter(([codon, count]) => codon.includes('G') || codon.includes('C'))
        .reduce((sum, [_, count]) => sum + count, 0);
    const gcContent = (gcCodons / totalCodons) * 100;

    if (gcContent < 30) {
        recommendations.push('Low GC content - consider increasing for better stability');
    } else if (gcContent > 70) {
        recommendations.push('High GC content - consider reducing for better expression');
    }

    return recommendations.length > 0 ? recommendations : ['Codon usage appears well-balanced'];
}

function displayRecommendations(recommendations) {
    const container = document.getElementById('optimizationRecommendations');
    container.innerHTML = recommendations.map(rec =>
        `<div class="recommendation-item">${rec}</div>`
    ).join('');
}

function analyzeCodonPatterns(codonCounts, totalCodons) {
    const rareCodons = Object.entries(codonCounts)
        .filter(([codon, count]) => count > 0 && (count / totalCodons) < 0.01)
        .length;

    const preferredCodons = Object.entries(codonCounts)
        .filter(([codon, count]) => (count / totalCodons) > 0.05)
        .length;

    return { rareCodons, preferredCodons };
}

// Codon Heatmap Functions
function loadCodonHeatmap(codonCounts) {
    const container = document.getElementById('codonHeatmap');
    if (!container) return;

    const totalCodons = Object.values(codonCounts).reduce((sum, count) => sum + count, 0);
    if (totalCodons === 0) {
        container.innerHTML = '<p class="no-data">No codon data available for heatmap</p>';
        return;
    }

    // Create heatmap grid
    const codons = Object.keys(CODON_TABLE || {});
    const maxCount = Math.max(...Object.values(codonCounts));

    let html = '';
    codons.forEach(codon => {
        const count = codonCounts[codon] || 0;
        const intensity = maxCount > 0 ? count / maxCount : 0;
        const color = getHeatmapColor(intensity);

        html += `
            <div class="codon-heatmap-item" 
                 style="background-color: ${color}" 
                 data-count="${count}"
                 title="${codon}: ${count} (${((count / totalCodons) * 100).toFixed(1)}%)">
                ${codon}
            </div>
        `;
    });

    container.innerHTML = html;
}

function getHeatmapColor(intensity) {
    // Create color gradient from light blue to dark blue
    const r = Math.floor(59 + (25 - 59) * intensity);
    const g = Math.floor(130 + (100 - 130) * intensity);
    const b = Math.floor(246 + (200 - 246) * intensity);
    return `rgb(${r}, ${g}, ${b})`;
}

// Logout function
function logout() {
    localStorage.removeItem('codoncraft_auth');
    window.location.href = '/login.html';
}

// User Profile Modal Functions
function openUserModal() {
    document.getElementById('userProfileModal').style.display = 'block';
}

function closeUserModal() {
    document.getElementById('userProfileModal').style.display = 'none';
}

function editAccount() {
    closeUserModal();
    // Navigate to settings page
    navigateToPage('settings');
}

function openLanguageSettings() {
    closeUserModal();
    alert('Language settings - Coming soon!');
}

// Navigate from Reports to Sequence with a prefilled sequence and run analysis
function openSequenceFromReport(sequence) {
    navigateToPage('sequence');
    setTimeout(() => {
        const input = document.getElementById('seqInput');
        if (input) {
            input.value = sequence;
            if (typeof analyzeSeq === 'function') {
                analyzeSeq(false); // Don't create a new report when viewing existing sequence
            }
        }
    }, 50);
}

function openNotifications() {
    closeUserModal();
    alert('Notification settings - Coming soon!');
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    const page = event.state?.page || getPageFromHash();
    if (page) {
        navigateToPageWithoutHistory(page);
    }
});

// Get page name from URL hash
function getPageFromHash() {
    const hash = window.location.hash.substring(1);
    return hash || 'dashboard';
}

// Navigate to page without updating history (for back/forward handling)
function navigateToPageWithoutHistory(pageName) {
    // Update UI without changing URL
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
        // Always refresh reports when navigating to this page
        setTimeout(() => {
            if (typeof refreshReports === 'function') {
                refreshReports();
            }
        }, 100);
    } else if (pageName === 'settings') {
        loadSettingsPage();
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (!checkAuthentication()) {
        return;
    }

    // Update user profile
    updateUserProfile();

    // Ensure database is connected before any pages that depend on it
    if (window.db && typeof window.db.connect === 'function') {
        window.db.connect().catch(() => { });
    }

    // Load dashboard data first
    loadDashboardData();

    // Initialize page based on URL hash
    const initialPage = getPageFromHash();
    console.log('Initializing with page:', initialPage);
    navigateToPageWithoutHistory(initialPage);

    // Also handle direct hash navigation
    window.addEventListener('hashchange', () => {
        const page = getPageFromHash();
        console.log('Hash changed to:', page);
        navigateToPageWithoutHistory(page);
    });

    // Live-refresh dashboard and reports when a new analysis is saved
    window.addEventListener('reportAdded', () => {
        try { loadDashboardData(); } catch (e) { }
        const reportsPage = document.getElementById('reportsPage');
        const isReportsActive = reportsPage && reportsPage.classList.contains('active');
        if (isReportsActive && typeof refreshReports === 'function') {
            try { refreshReports(); } catch (e) { }
        }
    });

    // Add user menu event listeners
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userModalClose = document.getElementById('userModalClose');
    const userProfileModal = document.getElementById('userProfileModal');

    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', openUserModal);
    }

    if (userModalClose) {
        userModalClose.addEventListener('click', closeUserModal);
    }

    // Close modal when clicking outside
    if (userProfileModal) {
        userProfileModal.addEventListener('click', (e) => {
            if (e.target === userProfileModal) {
                closeUserModal();
            }
        });
    }
});
