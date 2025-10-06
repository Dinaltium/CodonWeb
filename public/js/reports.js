function loadReportsPage() {
    const page = document.getElementById('reportsPage');
    if (page.innerHTML) {
        refreshReports();
        return;
    }
    
    page.innerHTML = `
        <style>
            .reports-container {
                max-width: 1200px;
            }
            
            .reports-card {
                background: white;
                border-radius: 12px;
                padding: 25px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .reports-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            
            .reports-table th {
                background: #f8f9fa;
                padding: 12px;
                text-align: left;
                font-weight: 600;
                color: #555;
                border-bottom: 2px solid #e0e0e0;
            }
            
            .reports-table td {
                padding: 12px;
                border-bottom: 1px solid #e9ecef;
            }
            
            .reports-table tr:hover {
                background: #f8f9fa;
            }
            
            .sequence-preview {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                color: #667eea;
                max-width: 300px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .date-time {
                color: #666;
                font-size: 14px;
            }
            
            .no-reports {
                text-align: center;
                padding: 40px;
                color: #999;
            }
            
            .refresh-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s;
                margin-bottom: 20px;
            }
            
            .refresh-btn:hover {
                transform: translateY(-2px);
            }
        </style>
        
        <div class="reports-container">
            <div class="page-header">
                <h1>📄 Analysis Reports</h1>
                <p class="subtitle">View your sequence analysis history</p>
            </div>
            
            <div class="reports-card">
                <button class="refresh-btn" onclick="refreshReports()">🔄 Refresh</button>
                <div id="reportsTableContainer"></div>
            </div>
        </div>
    `;
    
    refreshReports();
}

async function refreshReports() {
    const container = document.getElementById('reportsTableContainer');
    
    try {
        const response = await fetch('/api/reports');
        const reports = await response.json();
        
        if (reports.length === 0) {
            container.innerHTML = '<div class="no-reports">No reports available. Run a sequence analysis to generate reports.</div>';
            return;
        }
        
        let html = `
            <table class="reports-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Sequence Length</th>
                        <th>Codons</th>
                        <th>GC Content</th>
                        <th>AT Content</th>
                        <th>Sequence Preview</th>
                        <th>Created By</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        for (let report of reports) {
            const date = new Date(report.createdAt).toLocaleString();
            html += `
                <tr>
                    <td class="date-time">${date}</td>
                    <td>${report.sequenceLength}</td>
                    <td>${report.totalCodons}</td>
                    <td>${report.gcContent}%</td>
                    <td>${report.atContent}%</td>
                    <td class="sequence-preview">${report.sequence}...</td>
                    <td>${report.createdBy}</td>
                </tr>
            `;
        }
        
        html += `
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<div class="no-reports">Error loading reports.</div>';
    }
}
