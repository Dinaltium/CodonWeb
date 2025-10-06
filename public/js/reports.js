function loadReportsPage() {
    const page = document.getElementById('reportsPage');
    if (page.innerHTML) {
        refreshReports();
        return;
    }

    page.innerHTML = `
        <div class="page-header">
            <h1>Analysis Reports</h1>
            <p class="subtitle">View your sequence analysis history</p>
        </div>
        
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Reports</h2>
                <button class="btn btn-secondary" onclick="refreshReports()">Refresh</button>
            </div>
            <div id="reportsTableContainer"></div>
        </div>
    `;

    refreshReports();
}

async function refreshReports() {
    const container = document.getElementById('reportsTableContainer');

    try {
        const reports = await db.getReports();

        if (reports.length === 0) {
            container.innerHTML = '<div class="text-center" style="padding: 40px; color: #6b7280;">No reports available. Run a sequence analysis to generate reports.</div>';
            return;
        }

        let html = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Length</th>
                        <th>Codons</th>
                        <th>GC Content</th>
                        <th>AT Content</th>
                        <th>Sequence</th>
                        <th>Created By</th>
                    </tr>
                </thead>
                <tbody>
        `;

        for (let report of reports) {
            const date = new Date(report.createdAt).toLocaleString();
            const preview = (report.sequence || '').substring(0, 50);
            html += `
                <tr>
                    <td style="color: #6b7280; font-size: 14px;">${date}</td>
                    <td>${report.sequenceLength}</td>
                    <td>${report.totalCodons}</td>
                    <td>${report.gcContent}%</td>
                    <td>${report.atContent}%</td>
                    <td style="font-family: 'Courier New', monospace; font-size: 12px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        <a href="#sequence" onclick="openSequenceFromReport('${(report.sequence || '').replace(/[^ATCG]/g, '')}'); return false;" style="color:#2563eb; text-decoration: underline;">
                            ${preview}...
                        </a>
                    </td>
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
        container.innerHTML = '<div class="text-center" style="padding: 40px; color: #dc2626;">Error loading reports.</div>';
    }
}
