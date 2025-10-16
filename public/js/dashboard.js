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
        let totalAmbiguousCodons = 0;
        let totalNContent = 0;

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
                let ambiguousCodons = 0;
                let nCount = 0;


                for (let i = 0; i <= sequence.length - 3; i += 3) {
                    const codon = sequence.substr(i, 3);
                    if (codon.includes('N')) {
                        ambiguousCodons++;
                    } else if (window.CODON_TABLE && window.CODON_TABLE[codon]) {
                        codonCounts[codon] = (codonCounts[codon] || 0) + 1;
                        if (window.CODON_TABLE[codon] === 'STOP') {
                            stopCodons++;
                        }
                    }
                }

                // Count N characters
                nCount = (sequence.match(/N/g) || []).length;
                totalAmbiguousCodons += ambiguousCodons;
                totalNContent += nCount;

            }
        });

        document.getElementById('DNA').textContent = totalCodons;

        // Update combined GC/AT content display
        const avgGcContent = reports.length > 0 ? (totalGcContent / reports.length).toFixed(1) : 0;
        const avgAtContent = reports.length > 0 ? (100 - avgGcContent).toFixed(1) : 0;
        document.getElementById('avgGcContent').textContent = `${avgGcContent}% / ${avgAtContent}%`;
        document.getElementById('baseContentSubtitle').textContent = `GC / AT content`;


        // Update system status based on data availability
        updateSystemStatus(reports.length > 0);

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

        // Update ambiguous codon statistics if present
        if (totalAmbiguousCodons > 0 || totalNContent > 0) {
            updateAmbiguousStats(totalAmbiguousCodons, totalNContent);
        }

        // Update notification count
        updateNotificationCount(reports.length);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Show error state
        updateSystemStatus(false);
        showDashboardError();
    }
}

function updateSystemStatus(hasData) {
    // Update the system status pill
    const statusPill = document.getElementById('systemStatusPill');
    const statusText = statusPill.querySelector('.status-text');
    const statusIndicator = statusPill.querySelector('.status-indicator');

    if (hasData) {
        statusText.textContent = 'Online';
        statusPill.style.background = '#f0f9ff';
        statusPill.style.borderColor = '#0ea5e9';
        statusPill.style.color = '#0369a1';
        statusIndicator.style.background = '#10b981';
    } else {
        statusText.textContent = 'No Data';
        statusPill.style.background = '#fef2f2';
        statusPill.style.borderColor = '#f87171';
        statusPill.style.color = '#dc2626';
        statusIndicator.style.background = '#ef4444';
    }
}

function updateNotificationCount(reportCount) {
    const notifText = document.querySelector('.notif-text');
    if (notifText) {
        if (reportCount === 0) {
            notifText.textContent = 'No analyses yet';
        } else if (reportCount === 1) {
            notifText.textContent = '1 analysis completed';
        } else {
            notifText.textContent = `${reportCount} analyses completed`;
        }
    } else {
        console.warn('Notification text element not found');
    }
}

function updateAmbiguousStats(ambiguousCodons, nContent) {
    // Add a visual indicator in the recent analyses section
    const container = document.getElementById('recentAnalyses');
    const existingWarning = container.querySelector('.ambiguous-warning');

    if (existingWarning) {
        existingWarning.remove();
    }

    if (ambiguousCodons > 0 || nContent > 0) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'ambiguous-warning';
        warningDiv.style.cssText = `
            background: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        warningDiv.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>
                <strong>Ambiguous sequences detected:</strong> 
                ${ambiguousCodons} ambiguous codons, ${nContent} N bases found across analyses
            </span>
        `;

        container.insertBefore(warningDiv, container.firstChild);
    }
}

function showDashboardError() {
    // Show error message in recent analyses section
    const container = document.getElementById('recentAnalyses');
    container.innerHTML = '<div class="error-message">Error loading dashboard data. Please refresh the page.</div>';
}

function loadRecentAnalyses(reports) {
    const container = document.getElementById('recentAnalyses');

    if (reports.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <div class="no-data-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M9 12l2 2 4-4"></path>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
                    </svg>
                </div>
                <h3>No analyses yet</h3>
                <p>Start by analyzing a DNA sequence to see your results here!</p>
                <button class="action-btn primary" onclick="navigateToPage('sequence')" style="margin-top: 16px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"></path>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
                    </svg>
                    Start Analysis
                </button>
            </div>
        `;
        return;
    }

    const recentReports = reports.slice(0, 5); // Show last 5 analyses
    let html = '';

    recentReports.forEach((report, index) => {
        const sequence = report.sequence || '';
        const preview = sequence.length > 50 ? sequence.substring(0, 50) + '...' : sequence;
        const date = new Date(report.createdAt).toLocaleDateString();
        const time = new Date(report.createdAt).toLocaleTimeString();
        const isRecent = (Date.now() - new Date(report.createdAt).getTime()) < 24 * 60 * 60 * 1000; // Within 24 hours

        html += `
            <div class="analysis-item ${isRecent ? 'recent' : ''}">
                <div class="analysis-info">
                    <div class="analysis-header">
                        <div class="analysis-sequence">${preview}</div>
                        ${isRecent ? '<span class="recent-badge">Recent</span>' : ''}
                    </div>
                    <div class="analysis-stats">
                        <span class="stat-chip">${report.sequenceLength || 0} bp</span>
                        <span class="stat-chip">${report.totalCodons || 0} codons</span>
                        <span class="stat-chip">${report.gcContent || 0}% GC</span>
                        <span class="stat-chip">${report.createdBy || 'Unknown'}</span>
                    </div>
                    <div class="analysis-meta">
                        <span class="analysis-date">${date} at ${time}</span>
                    </div>
                </div>
                <div class="analysis-actions">
                    <button class="analysis-btn" onclick="viewAnalysis('${report._id}')" title="View Details">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        View
                    </button>
                    <button class="analysis-btn" onclick="exportAnalysis('${report._id}')" title="Export Data">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7,10 12,15 17,10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export
                    </button>
                </div>
            </div>
        `;
    });

    // Add "View All" button if there are more than 5 reports
    if (reports.length > 5) {
        html += `
            <div class="view-all-container">
                <button class="view-all-btn" onclick="navigateToPage('reports')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    View All ${reports.length} Reports
                </button>
            </div>
        `;
    }

    container.innerHTML = html;
}

function loadCodonOverview(codonCounts, stopCodons) {
    const totalCodons = Object.values(codonCounts).reduce((sum, count) => sum + count, 0);

    // Handle empty state
    if (totalCodons === 0) {
        document.getElementById('mostCommonCodon').textContent = '-';
        document.getElementById('codonDiversity').textContent = '0';
        document.getElementById('mostCommonCodonStats').textContent = '-';
        document.getElementById('codonDiversityStats').textContent = '0';
        document.getElementById('stopCodons').textContent = '0';
        document.getElementById('codonBiasIndex').textContent = '0.00';

        // Show empty state in chart
        createCodonChart({});
        return;
    }

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
    let codonBiasIndex = 0;
    for (const count of Object.values(codonCounts)) {
        if (count > 0) {
            const frequency = count / totalCodons;
            codonBiasIndex -= frequency * Math.log2(frequency);
        }
    }
    codonBiasIndex = codonBiasIndex.toFixed(2);

    // Update display
    document.getElementById('mostCommonCodon').textContent = mostCommonCodon;
    document.getElementById('codonDiversity').textContent = codonDiversity;
    document.getElementById('mostCommonCodonStats').textContent = mostCommonCodon;
    document.getElementById('codonDiversityStats').textContent = codonDiversity;
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

    // Handle empty state
    if (totalCodons === 0) {
        document.getElementById('mostAbundantAA').textContent = '-';
        document.getElementById('aaDiversity').textContent = '0';
        document.getElementById('hydrophobicAAs').textContent = '0%';
        document.getElementById('chargedAAs').textContent = '0%';

        // Show empty state in chart
        createAminoAcidChart({});
        return;
    }

    // Count amino acids (skip codons with N characters)
    for (const [codon, count] of Object.entries(codonCounts)) {
        if (!codon.includes('N') && window.CODON_TABLE && window.CODON_TABLE[codon]) {
            const aa = window.CODON_TABLE[codon];
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
    document.getElementById('hydrophobicAAs').textContent = ((hydrophobicCount / totalCodons) * 100).toFixed(1) + '%';
    document.getElementById('chargedAAs').textContent = ((chargedCount / totalCodons) * 100).toFixed(1) + '%';

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

    // Create heatmap grid (filter out codons with N characters)
    const codons = Object.keys(window.CODON_TABLE || {}).filter(codon => !codon.includes('N'));
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
    navigateToPageWithoutHistory(initialPage);

    // Also handle direct hash navigation
    window.addEventListener('hashchange', () => {
        const page = getPageFromHash();
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

    // Live-refresh dashboard when reports are deleted
    window.addEventListener('reportDeleted', () => {
        try { loadDashboardData(); } catch (e) { }
        const reportsPage = document.getElementById('reportsPage');
        const isReportsActive = reportsPage && reportsPage.classList.contains('active');
        if (isReportsActive && typeof refreshReports === 'function') {
            try { refreshReports(); } catch (e) { }
        }
    });

    // Add user menu event listeners
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userProfile = document.getElementById('userProfile');
    const userModalClose = document.getElementById('userModalClose');
    const userProfileModal = document.getElementById('userProfileModal');

    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the parent click
            openUserModal();
        });
    }

    if (userProfile) {
        userProfile.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const isCollapsed = sidebar.classList.contains('collapsed');

            if (isCollapsed) {
                // When collapsed, clicking anywhere on profile opens modal
                openUserModal();
            } else {
                // When expanded, only open modal if not clicking on the menu button
                if (!e.target.closest('.user-menu-btn')) {
                    openUserModal();
                }
            }
        });
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
