let allReports = [];
let filteredReports = [];
let selectedReports = new Set();

function loadReportsPage() {
    const page = document.getElementById('reportsPage');
    if (page.innerHTML) {
        refreshReports();
        return;
    }

    page.innerHTML = `
        <style>
            /* Advanced Filter System Styles */
            .filter-container {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                margin-bottom: 24px;
                overflow: hidden;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            }

            .filter-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                background: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
            }

            .filter-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                color: #1e293b;
                font-size: 14px;
            }

            .filter-actions {
                display: flex;
                gap: 12px;
                align-items: center;
            }

            .filter-status {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .filter-status .filter-count {
                font-size: 13px;
                color: #475569;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                background: #f1f5f9;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
            }

            .filter-status .filter-count::before {
                content: '';
                width: 8px;
                height: 8px;
                background: #3b82f6;
                border-radius: 50%;
            }

            .filter-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: #ffffff;
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.15s ease;
            }

            .filter-btn:hover {
                background: #f3f4f6;
                border-color: #9ca3af;
                color: #374151;
            }

            .filter-clear {
                color: #6b7280;
                border-color: #d1d5db;
                background: #f9fafb;
            }

            .filter-clear:hover {
                background: #f3f4f6;
                border-color: #9ca3af;
                color: #374151;
            }

            .filter-panel {
                padding: 20px;
                display: none;
            }

            .filter-panel.active {
                display: block;
            }

            .filter-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                gap: 24px;
                margin-bottom: 24px;
            }

            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .filter-label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                font-weight: 600;
                color: #374151;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 2px;
            }

            .search-container {
                position: relative;
            }

            .search-input {
                width: 100%;
                padding: 10px 16px 10px 40px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                background: #ffffff;
                transition: all 0.15s ease;
            }

            .search-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .search-icon {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #9ca3af;
                pointer-events: none;
            }

            .filter-select {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                background: #ffffff;
                cursor: pointer;
                transition: all 0.15s ease;
            }

            .filter-select:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .date-range {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .date-input {
                flex: 1;
                padding: 10px 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                background: #ffffff;
                transition: all 0.15s ease;
            }

            .date-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .date-separator {
                color: #6b7280;
                font-size: 12px;
                font-weight: 500;
                white-space: nowrap;
            }

            .range-container {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .range-input {
                flex: 1;
                padding: 12px 14px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                background: #ffffff;
                transition: all 0.15s ease;
                min-width: 0;
            }

            .range-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .range-separator {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 1px;
                background: #d1d5db;
                position: relative;
                flex-shrink: 0;
            }

            .range-line {
                width: 100%;
                height: 1px;
                background: #9ca3af;
            }


            /* Reports Header Styling */
            .reports-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 24px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e2e8f0;
            }

            .reports-title-section h2 {
                margin: 0 0 4px 0;
                font-size: 24px;
                font-weight: 700;
                color: #1e293b;
            }

            .reports-subtitle {
                margin: 0;
                font-size: 14px;
                color: #64748b;
                font-weight: 400;
            }

            .reports-actions {
                display: flex;
                gap: 12px;
                align-items: center;
            }

            .reports-actions .btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 10px 16px;
                border-radius: 8px;
                font-weight: 500;
                font-size: 14px;
                transition: all 0.15s ease;
            }

            .reports-actions .btn-secondary {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                color: #475569;
            }

            .reports-actions .btn-secondary:hover {
                background: #f1f5f9;
                border-color: #cbd5e1;
                color: #334155;
            }

            .reports-actions .btn-danger {
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #dc2626;
            }

            .reports-actions .btn-danger:hover {
                background: #fee2e2;
                border-color: #fca5a5;
                color: #b91c1c;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .filter-grid {
                    grid-template-columns: 1fr;
                }
                
                .filter-header {
                    flex-direction: column;
                    gap: 12px;
                    align-items: stretch;
                }
                
                .filter-actions {
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .filter-status {
                    order: 1;
                    width: 100%;
                    justify-content: center;
                }

                .filter-actions .filter-btn {
                    flex: 1;
                }
                
                .date-range {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 8px;
                }
                
                .date-separator {
                    text-align: center;
                }

                .reports-header {
                    flex-direction: column;
                    gap: 16px;
                    align-items: stretch;
                }

                .reports-actions {
                    justify-content: stretch;
                }

                .reports-actions .btn {
                    flex: 1;
                    justify-content: center;
                }
            }
        </style>
        
        <div class="page-header">
            <h1>Analysis Reports</h1>
            <p class="subtitle">View your sequence analysis history</p>
        </div>
        
        <div class="card">
            <div class="reports-header">
                <div class="reports-title-section">
                <h2>Reports</h2>
                    <p class="reports-subtitle">Manage and filter your sequence analysis reports</p>
                </div>
                <div class="reports-actions">
                    <button class="btn btn-danger" id="deleteSelectedBtn" onclick="deleteSelectedReports()" style="display: none;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Delete Selected
                    </button>
                    <button class="btn btn-secondary" onclick="refreshReports()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                            <polyline points="23,4 23,10 17,10"></polyline>
                            <polyline points="1,20 1,14 7,14"></polyline>
                            <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"></path>
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>
            
            <!-- Advanced Filter System -->
            <div class="filter-container">
                <div class="filter-header">
                    <div class="filter-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
                        </svg>
                        <span>Filters & Search</span>
                    </div>
                    <div class="filter-actions">
                        <div class="filter-status" id="filterStatus" style="display: none;">
                            <span class="filter-count" id="filterCount">0 filters applied</span>
                        </div>
                        <button class="filter-btn filter-clear" onclick="clearFilters()" id="clearAllBtn" style="display: none;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                            </svg>
                            Clear All
                        </button>
                        <button class="filter-btn filter-toggle" onclick="toggleFilterPanel()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6,9 12,15 18,9"></polyline>
                            </svg>
                            <span id="filterToggleText">Show Filters</span>
                        </button>
                    </div>
                </div>
                
                <div class="filter-panel" id="filterPanel">
                    <div class="filter-grid">
                        <!-- Search Section -->
                        <div class="filter-group">
                            <label class="filter-label">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="M21 21l-4.35-4.35"></path>
                                </svg>
                                Search
                            </label>
                            <div class="search-container">
                                <input type="text" id="searchInput" placeholder="Search sequences, users..." 
                                       class="search-input" onkeyup="filterReports()">
                                <div class="search-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="M21 21l-4.35-4.35"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <!-- User Filter -->
                        <div class="filter-group">
                            <label class="filter-label">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Created By
                            </label>
                            <select id="userFilter" class="filter-select" onchange="filterReports()">
                                <option value="">All Users</option>
                            </select>
                        </div>

                        <!-- Date Range -->
                        <div class="filter-group">
                            <label class="filter-label">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                Date Range
                            </label>
                            <div class="date-range">
                                <input type="date" id="startDate" class="date-input" onchange="filterReports()">
                                <span class="date-separator">to</span>
                                <input type="date" id="endDate" class="date-input" onchange="filterReports()">
                            </div>
                        </div>

                        <!-- Length Range -->
                        <div class="filter-group">
                            <label class="filter-label">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 3v18h18"></path>
                                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                                </svg>
                                Sequence Length
                            </label>
                            <div class="range-container">
                                <input type="number" id="minLength" placeholder="Min" class="range-input" onchange="filterReports()">
                                <div class="range-separator">
                                    <div class="range-line"></div>
                                </div>
                                <input type="number" id="maxLength" placeholder="Max" class="range-input" onchange="filterReports()">
                            </div>
                        </div>

                        <!-- GC Content Range -->
                        <div class="filter-group">
                            <label class="filter-label">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M8 12l2 2 4-4"></path>
                                </svg>
                                GC Content
                            </label>
                            <div class="range-container">
                                <input type="number" id="minGC" placeholder="Min%" min="0" max="100" class="range-input" onchange="filterReports()">
                                <div class="range-separator">
                                    <div class="range-line"></div>
                                </div>
                                <input type="number" id="maxGC" placeholder="Max%" min="0" max="100" class="range-input" onchange="filterReports()">
                            </div>
                        </div>

                        <!-- Codon Count Range -->
                        <div class="filter-group">
                            <label class="filter-label">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="14" width="7" height="7"></rect>
                                    <rect x="3" y="14" width="7" height="7"></rect>
                                </svg>
                                Codon Count
                            </label>
                            <div class="range-container">
                                <input type="number" id="minCodons" placeholder="Min" class="range-input" onchange="filterReports()">
                                <div class="range-separator">
                                    <div class="range-line"></div>
                                </div>
                                <input type="number" id="maxCodons" placeholder="Max" class="range-input" onchange="filterReports()">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="reportsTableContainer"></div>
        </div>
    `;

    refreshReports();
}

async function refreshReports() {
    const container = document.getElementById('reportsTableContainer');

    try {
        allReports = await window.db.getReports();
        filteredReports = [...allReports];

        // Populate user filter
        populateUserFilter();

        // Apply current filters
        filterReports();

    } catch (error) {
        container.innerHTML = '<div class="text-center" style="padding: 40px; color: #dc2626;">Error loading reports.</div>';
    }
}

function populateUserFilter() {
    const userFilter = document.getElementById('userFilter');
    if (!userFilter) return;

    const users = [...new Set(allReports.map(report => report.createdBy))].sort();
    userFilter.innerHTML = '<option value="">All Users</option>' +
        users.map(user => `<option value="${user}">${user}</option>`).join('');
}

function filterReports() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const userFilter = document.getElementById('userFilter')?.value || '';
    const startDate = document.getElementById('startDate')?.value || '';
    const endDate = document.getElementById('endDate')?.value || '';
    const minLength = parseInt(document.getElementById('minLength')?.value) || 0;
    const maxLength = parseInt(document.getElementById('maxLength')?.value) || Infinity;
    const minGC = parseFloat(document.getElementById('minGC')?.value) || 0;
    const maxGC = parseFloat(document.getElementById('maxGC')?.value) || 100;
    const minCodons = parseInt(document.getElementById('minCodons')?.value) || 0;
    const maxCodons = parseInt(document.getElementById('maxCodons')?.value) || Infinity;

    filteredReports = allReports.filter(report => {
        const matchesSearch = !searchTerm ||
            (report.sequence && report.sequence.toLowerCase().includes(searchTerm)) ||
            report.createdBy.toLowerCase().includes(searchTerm);

        const matchesUser = !userFilter || report.createdBy === userFilter;

        const matchesLength = report.sequenceLength >= minLength && report.sequenceLength <= maxLength;

        const matchesGC = report.gcContent >= minGC && report.gcContent <= maxGC;

        const matchesCodons = report.totalCodons >= minCodons && report.totalCodons <= maxCodons;

        let matchesDate = true;
        if (startDate || endDate) {
            const reportDate = new Date(report.createdAt);
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                matchesDate = matchesDate && reportDate >= start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchesDate = matchesDate && reportDate <= end;
            }
        }

        return matchesSearch && matchesUser && matchesLength && matchesGC && matchesCodons && matchesDate;
    });

    updateFilterSummary();
    renderReportsTable();
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('userFilter').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('minLength').value = '';
    document.getElementById('maxLength').value = '';
    document.getElementById('minGC').value = '';
    document.getElementById('maxGC').value = '';
    document.getElementById('minCodons').value = '';
    document.getElementById('maxCodons').value = '';
    filterReports();
}

function toggleFilterPanel() {
    const panel = document.getElementById('filterPanel');
    const toggleText = document.getElementById('filterToggleText');

    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
        toggleText.textContent = 'Show Filters';
    } else {
        panel.classList.add('active');
        toggleText.textContent = 'Hide Filters';
    }
}

function updateFilterSummary() {
    const searchTerm = document.getElementById('searchInput')?.value || '';
    const userFilter = document.getElementById('userFilter')?.value || '';
    const startDate = document.getElementById('startDate')?.value || '';
    const endDate = document.getElementById('endDate')?.value || '';
    const minLength = document.getElementById('minLength')?.value || '';
    const maxLength = document.getElementById('maxLength')?.value || '';
    const minGC = document.getElementById('minGC')?.value || '';
    const maxGC = document.getElementById('maxGC')?.value || '';
    const minCodons = document.getElementById('minCodons')?.value || '';
    const maxCodons = document.getElementById('maxCodons')?.value || '';

    let activeFilters = 0;
    if (searchTerm) activeFilters++;
    if (userFilter) activeFilters++;
    if (startDate || endDate) activeFilters++;
    if (minLength || maxLength) activeFilters++;
    if (minGC || maxGC) activeFilters++;
    if (minCodons || maxCodons) activeFilters++;

    const filterStatus = document.getElementById('filterStatus');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const filterCount = document.getElementById('filterCount');

    if (activeFilters > 0) {
        // Show filter status and clear button when filters are applied
        if (filterStatus) filterStatus.style.display = 'flex';
        if (clearAllBtn) clearAllBtn.style.display = 'flex';
        if (filterCount) {
            filterCount.textContent = `${activeFilters} filter${activeFilters !== 1 ? 's' : ''} applied`;
        }
    } else {
        // Hide filter status and clear button when no filters are applied
        if (filterStatus) filterStatus.style.display = 'none';
        if (clearAllBtn) clearAllBtn.style.display = 'none';
    }
}

function renderReportsTable() {
    const container = document.getElementById('reportsTableContainer');

    if (filteredReports.length === 0) {
        container.innerHTML = '<div class="text-center" style="padding: 40px; color: #6b7280;">No reports match your filters.</div>';
        return;
    }

    let html = `
            <table class="table">
                <thead>
                    <tr>
                    <th style="width: 40px;">
                        <input type="checkbox" id="selectAll" onchange="toggleSelectAll()" style="transform: scale(1.2);">
                    </th>
                        <th>Date</th>
                        <th>Length</th>
                        <th>Codons</th>
                        <th>GC Content</th>
                        <th>AT Content</th>
                        <th>Sequence</th>
                        <th>Created By</th>
                    <th style="width: 80px;">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

    for (let report of filteredReports) {
        const date = new Date(report.createdAt).toLocaleString();
        const preview = (report.sequence || '').substring(0, 50);
        const isSelected = selectedReports.has(report._id);

        html += `
            <tr style="${isSelected ? 'background-color: #f0f9ff;' : ''}">
                <td>
                    <input type="checkbox" ${isSelected ? 'checked' : ''} 
                           onchange="toggleReportSelection('${report._id}')" 
                           style="transform: scale(1.2);">
                </td>
                    <td style="color: #6b7280; font-size: 14px;">${date}</td>
                    <td>${report.sequenceLength}</td>
                    <td>${report.totalCodons}</td>
                    <td>${report.gcContent}%</td>
                    <td>${report.atContent}%</td>
                <td style="font-family: 'Courier New', monospace; font-size: 12px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <a href="#sequence" onclick="openSequenceFromReport('${report.sequence || ''}'); return false;" style="color:#1e40af; text-decoration: none; font-weight: 500; padding: 2px 6px; border-radius: 4px; background: #eff6ff; transition: all 0.15s ease; position: relative;">
                        ${preview}...
                        ${(report.sequence || '').includes('N') ? '<span style="color: #dc2626; font-weight: bold; margin-left: 4px;" title="Contains ambiguous bases (N)">⚠</span>' : ''}
                    </a>
                </td>
                    <td>${report.createdBy}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteSingleReport('${report._id}')" 
                            style="padding: 4px 8px; font-size: 12px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                        </svg>
                    </button>
                </td>
                </tr>
            `;
    }

    html += `
                </tbody>
            </table>
        `;

    container.innerHTML = html;
    updateDeleteButtonVisibility();
}

function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        const reportId = checkbox.getAttribute('onchange').match(/'([^']+)'/)[1];
        if (selectAllCheckbox.checked) {
            selectedReports.add(reportId);
        } else {
            selectedReports.delete(reportId);
        }
    });

    updateDeleteButtonVisibility();
}

function toggleReportSelection(reportId) {
    if (selectedReports.has(reportId)) {
        selectedReports.delete(reportId);
    } else {
        selectedReports.add(reportId);
    }
    updateDeleteButtonVisibility();
}

function updateDeleteButtonVisibility() {
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    if (deleteBtn) {
        deleteBtn.style.display = selectedReports.size > 0 ? 'block' : 'none';
    }
}

async function deleteSelectedReports() {
    if (selectedReports.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedReports.size} report(s)?`)) {
        return;
    }

    try {
        for (const reportId of selectedReports) {
            await window.db.deleteReport(reportId);
        }

        selectedReports.clear();
        await refreshReports();

        // Dispatch event to update dashboard
        window.dispatchEvent(new Event('reportDeleted'));

        // Show success message
        const container = document.getElementById('reportsTableContainer');
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.style.cssText = 'background: #d1fae5; color: #065f46; padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #a7f3d0;';
        successDiv.textContent = 'Selected reports deleted successfully.';
        container.insertBefore(successDiv, container.firstChild);

        setTimeout(() => successDiv.remove(), 3000);

    } catch (error) {
        console.error('Error deleting reports:', error);
        alert('Error deleting reports. Please try again.');
    }
}

async function deleteSingleReport(reportId) {
    if (!confirm('Are you sure you want to delete this report?')) {
        return;
    }

    try {
        await window.db.deleteReport(reportId);
        selectedReports.delete(reportId);
        await refreshReports();

        // Dispatch event to update dashboard
        window.dispatchEvent(new Event('reportDeleted'));

        // Show success message
        const container = document.getElementById('reportsTableContainer');
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.style.cssText = 'background: #d1fae5; color: #065f46; padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #a7f3d0;';
        successDiv.textContent = 'Report deleted successfully.';
        container.insertBefore(successDiv, container.firstChild);

        setTimeout(() => successDiv.remove(), 3000);

    } catch (error) {
        console.error('Error deleting report:', error);
        alert('Error deleting report. Please try again.');
    }
}
