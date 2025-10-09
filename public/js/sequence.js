window.CODON_TABLE = {
    'TTT': 'Phe', 'TTC': 'Phe', 'TTA': 'Leu', 'TTG': 'Leu',
    'TCT': 'Ser', 'TCC': 'Ser', 'TCA': 'Ser', 'TCG': 'Ser',
    'TAT': 'Tyr', 'TAC': 'Tyr', 'TAA': 'STOP', 'TAG': 'STOP',
    'TGT': 'Cys', 'TGC': 'Cys', 'TGA': 'STOP', 'TGG': 'Trp',
    'CTT': 'Leu', 'CTC': 'Leu', 'CTA': 'Leu', 'CTG': 'Leu',
    'CCT': 'Pro', 'CCC': 'Pro', 'CCA': 'Pro', 'CCG': 'Pro',
    'CAT': 'His', 'CAC': 'His', 'CAA': 'Gln', 'CAG': 'Gln',
    'CGT': 'Arg', 'CGC': 'Arg', 'CGA': 'Arg', 'CGG': 'Arg',
    'ATT': 'Ile', 'ATC': 'Ile', 'ATA': 'Ile', 'ATG': 'Met',
    'ACT': 'Thr', 'ACC': 'Thr', 'ACA': 'Thr', 'ACG': 'Thr',
    'AAT': 'Asn', 'AAC': 'Asn', 'AAA': 'Lys', 'AAG': 'Lys',
    'AGT': 'Ser', 'AGC': 'Ser', 'AGA': 'Arg', 'AGG': 'Arg',
    'GTT': 'Val', 'GTC': 'Val', 'GTA': 'Val', 'GTG': 'Val',
    'GCT': 'Ala', 'GCC': 'Ala', 'GCA': 'Ala', 'GCG': 'Ala',
    'GAT': 'Asp', 'GAC': 'Asp', 'GAA': 'Glu', 'GAG': 'Glu',
    'GGT': 'Gly', 'GGC': 'Gly', 'GGA': 'Gly', 'GGG': 'Gly'
};

const AA_NAMES = {
    'Phe': 'Phenylalanine', 'Leu': 'Leucine', 'Ser': 'Serine',
    'Tyr': 'Tyrosine', 'STOP': 'Stop Codon', 'Cys': 'Cysteine',
    'Trp': 'Tryptophan', 'Pro': 'Proline', 'His': 'Histidine',
    'Gln': 'Glutamine', 'Arg': 'Arginine', 'Ile': 'Isoleucine',
    'Met': 'Methionine', 'Thr': 'Threonine', 'Asn': 'Asparagine',
    'Lys': 'Lysine', 'Val': 'Valine', 'Ala': 'Alanine',
    'Asp': 'Aspartic acid', 'Glu': 'Glutamic acid', 'Gly': 'Glycine'
};

function initSequencePage() {
    const page = document.getElementById('sequencePage');
    if (page.innerHTML) return;

    page.innerHTML = `
        <style>
            .sequence-container {
                max-width: 1200px;
            }
            
            .seq-card {
                background: white;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .seq-card h2 {
                color: #1f2937;
                margin-bottom: 20px;
                font-size: 1.5em;
                font-weight: 600;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 12px;
            }
            
            .seq-card h3 {
                color: #374151;
                margin: 24px 0 12px;
                font-size: 1.2em;
                font-weight: 600;
            }
            
            textarea {
                width: 100%;
                min-height: 150px;
                padding: 16px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                resize: vertical;
                background: #fafafa;
                transition: all 0.2s ease;
            }
            
            textarea:focus {
                outline: none;
                border-color: #2563eb;
                background: white;
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
            }
            
            .button-group {
                display: flex;
                gap: 10px;
                margin-top: 15px;
                flex-wrap: wrap;
                position: relative;
            }
            
            .dropdown-container {
                position: relative;
                display: inline-block;
            }
            
            .dropdown-btn {
                background: #f8f9fa;
                color: #374151;
                border: 1px solid #d1d5db;
                padding: 12px 20px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .dropdown-btn:hover {
                background: #e9ecef;
                border-color: #9ca3af;
                color: #1f2937;
            }
            
            .dropdown-arrow {
                transition: transform 0.3s ease;
            }
            
            .dropdown-arrow.open {
                transform: rotate(180deg);
            }
            
            .dropdown-content {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                background: white;
                min-width: 280px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                z-index: 1000;
                margin-top: 8px;
                overflow: hidden;
            }
            
            .dropdown-content.show {
                display: block;
                animation: dropdownFadeIn 0.2s ease-out;
            }
            
            @keyframes dropdownFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .dropdown-header {
                padding: 16px 20px 12px;
                border-bottom: 1px solid #e5e7eb;
                background: #f9fafb;
            }
            
            .dropdown-title {
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin: 0;
            }
            
            .dropdown-subtitle {
                font-size: 12px;
                color: #6b7280;
                margin: 4px 0 0;
            }
            
            .dropdown-item {
                padding: 12px 20px;
                cursor: pointer;
                transition: background-color 0.2s;
                border-bottom: 1px solid #f5f5f5;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .dropdown-item:last-child {
                border-bottom: none;
            }
            
            .dropdown-item:hover {
                background: #f8f9fa;
            }
            
            .dropdown-item-icon {
                width: 32px;
                height: 32px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
                color: white;
                flex-shrink: 0;
            }
            
            .dropdown-item-content {
                flex: 1;
            }
            
            .dropdown-item-title {
                font-size: 14px;
                font-weight: 500;
                color: #374151;
                margin: 0 0 2px;
            }
            
            .dropdown-item-desc {
                font-size: 12px;
                color: #6b7280;
                margin: 0;
            }
            
            .dropdown-item-ratio {
                font-size: 11px;
                color: #9ca3af;
                font-family: 'Courier New', monospace;
                background: #f1f5f9;
                padding: 2px 6px;
                border-radius: 4px;
            }
            
            .seq-btn {
                background: #2563eb;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .seq-btn:hover {
                background: #1d4ed8;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            }
            
            .seq-btn.secondary {
                background: #6b7280;
                color: white;
            }
            
            .seq-btn.secondary:hover {
                background: #4b5563;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
            }
            
            .loading {
                display: none;
                text-align: center;
                padding: 20px;
            }
            
            .loading.active {
                display: block;
            }
            
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto 10px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .results {
                display: none;
            }
            
            .results.active {
                display: block;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 25px;
            }
            
            .stat-box {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
            }
            
            .stat-value {
                font-size: 2em;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 5px;
            }
            
            .stat-label {
                color: #666;
                font-size: 0.9em;
            }
            
            .codon-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                gap: 8px;
                margin-top: 15px;
            }
            
            .codon-box {
                background: #f8f9fa;
                border-radius: 6px;
                padding: 10px;
                text-align: center;
                border: 2px solid #e9ecef;
            }
            
            .codon-name {
                font-family: 'Courier New', monospace;
                font-weight: 700;
                font-size: 0.95em;
                color: #333;
                margin-bottom: 4px;
            }
            
            .codon-count {
                font-size: 1.2em;
                color: #667eea;
                font-weight: 600;
            }
            
            .codon-aa {
                font-size: 0.8em;
                color: #888;
                margin-top: 4px;
            }
            
            .aa-section {
                margin-top: 25px;
            }
            
            .aa-group {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
            }
            
            .aa-header {
                font-weight: 700;
                color: #667eea;
                margin-bottom: 8px;
                font-size: 1.1em;
            }
            
            .aa-codons {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .aa-codon-item {
                background: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-family: 'Courier New', monospace;
                border: 1px solid #dee2e6;
            }
            
            .aa-codon-item .count {
                color: #667eea;
                font-weight: 600;
                margin-left: 5px;
            }
            
            .chart-container {
                margin-top: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
            }
            
            .bar-chart {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .bar-row {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .bar-label {
                font-family: 'Courier New', monospace;
                font-weight: 600;
                min-width: 60px;
                font-size: 0.9em;
            }
            
            .bar-wrapper {
                flex: 1;
                background: #e9ecef;
                border-radius: 4px;
                height: 24px;
                position: relative;
                overflow: hidden;
            }
            
            .bar-fill {
                height: 100%;
                background: #2563eb;
                border-radius: 4px;
                transition: width 0.5s ease;
                display: flex;
                align-items: center;
                padding-right: 8px;
                justify-content: flex-end;
            }
            
            .bar-value {
                color: white;
                font-size: 0.85em;
                font-weight: 600;
                min-width: 30px;
                text-align: right;
            }
            
            .error-message {
                background: #fee;
                border: 2px solid #fcc;
                color: #c33;
                padding: 15px;
                border-radius: 8px;
                margin-top: 15px;
            }
        </style>
        
        <div class="sequence-container">
            <div class="page-header">
                <h1>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; margin-right: 8px; vertical-align: middle;">
                        <path d="M9 12l2 2 4-4"></path>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
                    </svg>
                    Sequence Analysis
                </h1>
                <p class="subtitle">Analyze DNA sequences for codon usage and GC content</p>
            </div>
            
            <div class="seq-card">
                <label for="seqInput">Enter DNA Sequence (ATCGN allowed):</label>
                <textarea id="seqInput" placeholder="Paste your DNA sequence here..."></textarea>
                <div class="button-group">
                    <button class="seq-btn" onclick="analyzeSeq()">Analyze Sequence</button>
                    <div class="dropdown-container">
                        <button class="dropdown-btn" onclick="toggleSequenceDropdown()">
                            Load Example
                            <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6,9 12,15 18,9"></polyline>
                            </svg>
                        </button>
                        <div class="dropdown-content" id="sequenceDropdown">
                            <div class="dropdown-header">
                                <h4 class="dropdown-title">Sequence Generator</h4>
                                <p class="dropdown-subtitle">Choose a sequence type to generate</p>
                            </div>
                            <div class="dropdown-item" onclick="generateSequence('balanced')">
                                <div class="dropdown-item-icon" style="background: #10b981;">B</div>
                                <div class="dropdown-item-content">
                                    <div class="dropdown-item-title">Balanced</div>
                                    <div class="dropdown-item-desc">Equal distribution of all bases</div>
                                </div>
                                <div class="dropdown-item-ratio">25:25:25:25</div>
                            </div>
                            <div class="dropdown-item" onclick="generateSequence('at-rich')">
                                <div class="dropdown-item-icon" style="background: #f59e0b;">A</div>
                                <div class="dropdown-item-content">
                                    <div class="dropdown-item-title">AT-rich</div>
                                    <div class="dropdown-item-desc">High adenine and thymine content</div>
                                </div>
                                <div class="dropdown-item-ratio">40:30:15:15</div>
                            </div>
                            <div class="dropdown-item" onclick="generateSequence('gc-rich')">
                                <div class="dropdown-item-icon" style="background: #3b82f6;">G</div>
                                <div class="dropdown-item-content">
                                    <div class="dropdown-item-title">GC-rich</div>
                                    <div class="dropdown-item-desc">High guanine and cytosine content</div>
                                </div>
                                <div class="dropdown-item-ratio">15:15:35:35</div>
                            </div>
                            <div class="dropdown-item" onclick="generateSequence('biased')">
                                <div class="dropdown-item-icon" style="background: #8b5cf6;">B</div>
                                <div class="dropdown-item-content">
                                    <div class="dropdown-item-title">Biased</div>
                                    <div class="dropdown-item-desc">Heavily skewed base composition</div>
                                </div>
                                <div class="dropdown-item-ratio">50:20:20:10</div>
                            </div>
                            <div class="dropdown-item" onclick="generateSequence('low-quality')">
                                <div class="dropdown-item-icon" style="background: #ef4444;">L</div>
                                <div class="dropdown-item-content">
                                    <div class="dropdown-item-title">Low-quality</div>
                                    <div class="dropdown-item-desc">Includes ambiguous bases (N)</div>
                                </div>
                                <div class="dropdown-item-ratio">40:30:20:10:5</div>
                            </div>
                            <div class="dropdown-item" onclick="generateSequence('random')">
                                <div class="dropdown-item-icon" style="background: #6b7280;">R</div>
                                <div class="dropdown-item-content">
                                    <div class="dropdown-item-title">Random</div>
                                    <div class="dropdown-item-desc">Randomly generated sequence</div>
                                </div>
                                <div class="dropdown-item-ratio">25:25:25:25</div>
                            </div>
                            <div class="dropdown-item" onclick="generateSequence('repetitive')">
                                <div class="dropdown-item-icon" style="background: #f97316;">R</div>
                                <div class="dropdown-item-content">
                                    <div class="dropdown-item-title">Repetitive</div>
                                    <div class="dropdown-item-desc">Motif-based repetitive sequence</div>
                                </div>
                                <div class="dropdown-item-ratio">AT/GC</div>
                            </div>
                        </div>
                    </div>
                    <button class="seq-btn secondary" onclick="clearSeq()">Clear</button>
                </div>
            </div>
            
            <div class="loading" id="seqLoading">
                <div class="spinner"></div>
                <p>Analyzing sequence...</p>
            </div>
            
            <div class="results" id="seqResults">
                <div class="seq-card">
                    <h2>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; margin-right: 6px; vertical-align: middle;">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Summary Statistics
                    </h2>
                    <div class="stats-grid" id="seqStatsGrid"></div>
                </div>
                
                <div class="seq-card">
                    <h2>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; margin-right: 6px; vertical-align: middle;">
                            <path d="M3 3v18h18"></path>
                            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                        </svg>
                        Codon Frequency Analysis
                    </h2>
                    <div id="seqCodonFreq"></div>
                </div>
                
                <div class="seq-card">
                    <h2>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; margin-right: 6px; vertical-align: middle;">
                            <path d="M9 12l2 2 4-4"></path>
                            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
                        </svg>
                        Amino Acid Translation
                    </h2>
                    <div id="seqAminoAcids"></div>
                </div>
                
                <div class="seq-card">
                    <h2>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; margin-right: 6px; vertical-align: middle;">
                            <path d="M3 3v18h18"></path>
                            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                        </svg>
                        Top 20 Most Frequent Codons
                    </h2>
                    <div class="chart-container">
                        <div class="bar-chart" id="seqTopCodons"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function validateSeq(sequence) {
    const cleanSeq = sequence.toUpperCase().replace(/\s/g, '');

    if (cleanSeq.length === 0) {
        return { valid: false, error: 'Please enter a DNA sequence.' };
    }

    if (!/^[ATCGN]+$/.test(cleanSeq)) {
        return { valid: false, error: 'Invalid characters detected. Only A, T, C, G, and N are allowed.' };
    }

    if (cleanSeq.length < 3) {
        return { valid: false, error: 'Sequence is too short. Minimum length is 3 nucleotides.' };
    }

    return { valid: true, sequence: cleanSeq };
}

function analyzeSeq(createReport = true) {
    const sequenceInput = document.getElementById('seqInput').value;
    const validation = validateSeq(sequenceInput);

    document.getElementById('seqResults').classList.remove('active');

    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();

    if (!validation.valid) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = validation.error;
        document.querySelector('.seq-card').appendChild(errorDiv);
        return;
    }

    document.getElementById('seqLoading').classList.add('active');

    setTimeout(() => {
        performSeqAnalysis(validation.sequence, createReport);
        document.getElementById('seqLoading').classList.remove('active');
        document.getElementById('seqResults').classList.add('active');
    }, 800);
}

function performSeqAnalysis(sequence, createReport = true) {
    const codonCounts = {};
    for (let codon in window.CODON_TABLE) {
        codonCounts[codon] = 0;
    }

    let totalCodons = 0;
    let ambiguousCodons = 0;

    for (let i = 0; i <= sequence.length - 3; i += 3) {
        const codon = sequence.substr(i, 3);
        if (codon.includes('N')) {
            ambiguousCodons++;
        } else if (window.CODON_TABLE[codon]) {
            codonCounts[codon]++;
            totalCodons++;
        }
    }

    const gcCount = (sequence.match(/[GC]/g) || []).length;
    const gcContent = ((gcCount / sequence.length) * 100).toFixed(2);

    const atCount = (sequence.match(/[AT]/g) || []).length;
    const atContent = ((atCount / sequence.length) * 100).toFixed(2);

    const nCount = (sequence.match(/N/g) || []).length;
    const nContent = ((nCount / sequence.length) * 100).toFixed(2);

    displaySeqStats(sequence.length, totalCodons, gcContent, atContent, sequence, createReport, ambiguousCodons, nContent);
    displaySeqCodonFrequency(codonCounts);
    displaySeqAminoAcids(codonCounts);
    displaySeqTopCodons(codonCounts, totalCodons);
}

async function displaySeqStats(length, totalCodons, gcContent, atContent, sequence, createReport = true, ambiguousCodons = 0, nContent = 0) {
    const statsGrid = document.getElementById('seqStatsGrid');

    let statsHTML = `
        <div class="stat-box">
            <div class="stat-value">${length}</div>
            <div class="stat-label">Nucleotides</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${totalCodons}</div>
            <div class="stat-label">Total Codons</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${gcContent}%</div>
            <div class="stat-label">GC Content</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${atContent}%</div>
            <div class="stat-label">AT Content</div>
        </div>
    `;

    // Add ambiguous codons and N content if present
    if (ambiguousCodons > 0 || nContent > 0) {
        statsHTML += `
            <div class="stat-box">
                <div class="stat-value">${ambiguousCodons}</div>
                <div class="stat-label">Ambiguous Codons</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${nContent}%</div>
                <div class="stat-label">N Content</div>
            </div>
        `;
    }

    statsGrid.innerHTML = statsHTML;

    // Only create a new report if createReport is true
    if (createReport && window.db) {
        try {
            await window.db.addReport({
                sequenceLength: length,
                totalCodons,
                gcContent,
                atContent,
                sequence,
                createdBy: currentUser?.username || 'Admin'
            });
            // Notify other pages (dashboard/reports) that a new report was added
            try {
                window.dispatchEvent(new CustomEvent('reportAdded'));
            } catch (e) { }

            // Proactively refresh dashboard statistics if available
            if (typeof loadDashboardData === 'function') {
                try { loadDashboardData(); } catch (e) { }
            }
        } catch (error) {
            console.error('Error saving report:', error);
        }
    }
}

function displaySeqCodonFrequency(codonCounts) {
    const container = document.getElementById('seqCodonFreq');
    let html = '<div class="codon-grid">';

    for (let codon in window.CODON_TABLE) {
        const count = codonCounts[codon];
        const aa = window.CODON_TABLE[codon];
        html += `
            <div class="codon-box">
                <div class="codon-name">${codon}</div>
                <div class="codon-count">${count}</div>
                <div class="codon-aa">${aa}</div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

function displaySeqAminoAcids(codonCounts) {
    const aaGroups = {};

    for (let codon in window.CODON_TABLE) {
        const aa = window.CODON_TABLE[codon];
        if (!aaGroups[aa]) {
            aaGroups[aa] = [];
        }
        aaGroups[aa].push({ codon, count: codonCounts[codon] });
    }

    const container = document.getElementById('seqAminoAcids');
    let html = '<div class="aa-section">';

    const sortedAAs = Object.keys(aaGroups).sort();

    for (let aa of sortedAAs) {
        const codons = aaGroups[aa];
        const totalCount = codons.reduce((sum, c) => sum + c.count, 0);
        const fullName = AA_NAMES[aa] || aa;

        html += `
            <div class="aa-group">
                <div class="aa-header">${aa} - ${fullName} (Total: ${totalCount})</div>
                <div class="aa-codons">
        `;

        for (let codonData of codons) {
            html += `
                <div class="aa-codon-item">
                    ${codonData.codon}<span class="count">${codonData.count}</span>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

function displaySeqTopCodons(codonCounts, totalCodons) {
    const codonArray = Object.entries(codonCounts)
        .map(([codon, count]) => ({ codon, count, aa: window.CODON_TABLE[codon] }))
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    const maxCount = codonArray.length > 0 ? codonArray[0].count : 1;
    const container = document.getElementById('seqTopCodons');

    if (codonArray.length === 0) {
        container.innerHTML = '<p>No codons found in sequence.</p>';
        return;
    }

    let html = '';
    for (let item of codonArray) {
        const percentage = ((item.count / totalCodons) * 100).toFixed(1);
        const barWidth = (item.count / maxCount) * 100;

        html += `
            <div class="bar-row">
                <div class="bar-label">${item.codon} (${item.aa})</div>
                <div class="bar-wrapper">
                    <div class="bar-fill" style="width: ${barWidth}%">
                        <span class="bar-value">${item.count} (${percentage}%)</span>
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

function loadSeqExample() {
    const exampleSequence = 'ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAGTTCGAACAAAGGTGAAACGAAGCACAAACACAACGTTAACGTCAGGGGATCATCCTTGGAGCATCCGTGGTATCATAAGAGATCGATAGTTCGAACAAAGGTGAACATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAGTTCGAACAAAGGTGAAACGAAGCACAAACACAACGTTAACGTCAGGGGATCATCCTTGGAGCATCCGTGGTATCATAAGAGATCGATAGTTCGAACAAAGGTGAA';
    document.getElementById('seqInput').value = exampleSequence;
}

function clearSeq() {
    document.getElementById('seqInput').value = '';
    document.getElementById('seqResults').classList.remove('active');
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
}

// Dropdown functionality
function toggleSequenceDropdown() {
    const dropdown = document.getElementById('sequenceDropdown');
    const arrow = document.querySelector('.dropdown-arrow');

    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        arrow.classList.remove('open');
    } else {
        dropdown.classList.add('show');
        arrow.classList.add('open');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('sequenceDropdown');
    const dropdownContainer = document.querySelector('.dropdown-container');

    if (dropdown && !dropdownContainer.contains(event.target)) {
        dropdown.classList.remove('show');
        const arrow = document.querySelector('.dropdown-arrow');
        if (arrow) arrow.classList.remove('open');
    }
});

// Sequence generation functions
function generateSequence(type) {
    const length = 300; // Default sequence length
    let sequence = '';

    switch (type) {
        case 'balanced':
            sequence = generateBalancedSequence(length);
            break;
        case 'at-rich':
            sequence = generateATRichSequence(length);
            break;
        case 'gc-rich':
            sequence = generateGCRichSequence(length);
            break;
        case 'biased':
            sequence = generateBiasedSequence(length);
            break;
        case 'low-quality':
            sequence = generateLowQualitySequence(length);
            break;
        case 'random':
            sequence = generateRandomSequence(length);
            break;
        case 'repetitive':
            sequence = generateRepetitiveSequence(length);
            break;
        default:
            sequence = generateBalancedSequence(length);
    }

    document.getElementById('seqInput').value = sequence;

    // Close dropdown
    const dropdown = document.getElementById('sequenceDropdown');
    const arrow = document.querySelector('.dropdown-arrow');
    dropdown.classList.remove('show');
    arrow.classList.remove('open');

    // Clear any existing results
    document.getElementById('seqResults').classList.remove('active');
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
}

function generateBalancedSequence(length) {
    const bases = ['A', 'T', 'C', 'G'];
    let sequence = '';

    for (let i = 0; i < length; i++) {
        sequence += bases[Math.floor(Math.random() * 4)];
    }

    return sequence;
}

function generateATRichSequence(length) {
    const bases = ['A', 'A', 'A', 'A', 'T', 'T', 'T', 'C', 'C', 'G', 'G'];
    let sequence = '';

    for (let i = 0; i < length; i++) {
        sequence += bases[Math.floor(Math.random() * bases.length)];
    }

    return sequence;
}

function generateGCRichSequence(length) {
    const bases = ['G', 'G', 'G', 'G', 'C', 'C', 'C', 'A', 'T'];
    let sequence = '';

    for (let i = 0; i < length; i++) {
        sequence += bases[Math.floor(Math.random() * bases.length)];
    }

    return sequence;
}

function generateBiasedSequence(length) {
    const bases = ['A', 'A', 'A', 'A', 'A', 'T', 'T', 'C', 'C', 'G'];
    let sequence = '';

    for (let i = 0; i < length; i++) {
        sequence += bases[Math.floor(Math.random() * bases.length)];
    }

    return sequence;
}

function generateLowQualitySequence(length) {
    const bases = ['A', 'A', 'A', 'A', 'T', 'T', 'T', 'C', 'C', 'G', 'N'];
    let sequence = '';

    for (let i = 0; i < length; i++) {
        sequence += bases[Math.floor(Math.random() * bases.length)];
    }

    return sequence;
}

function generateRandomSequence(length) {
    const bases = ['A', 'T', 'C', 'G'];
    let sequence = '';

    for (let i = 0; i < length; i++) {
        sequence += bases[Math.floor(Math.random() * 4)];
    }

    return sequence;
}

function generateRepetitiveSequence(length) {
    const motifs = ['AT', 'GC', 'GCGC', 'ATAT', 'GATC'];
    const motif = motifs[Math.floor(Math.random() * motifs.length)];

    let sequence = '';
    while (sequence.length < length) {
        sequence += motif;
    }

    return sequence.substring(0, length);
}
