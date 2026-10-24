/**
 * Main Application - Riatirimba Finance Dashboard
 * Uses Registration Number as primary identifier
 */
const App = {
    currentPage: 'dashboard',
    currentData: null,

    // ===== INIT =====
    init() {
        this.setupNavigation();
        this.setupModals();
        this.loadPage('dashboard');
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        this.checkApiStatus();
    },

    // ===== NAVIGATION =====
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.loadPage(page);
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                if (window.innerWidth <= 768) {
                    document.getElementById('sidebar').classList.remove('open');
                }
            });
        });

        const header = document.querySelector('.header-actions');
        const toggle = document.createElement('button');
        toggle.className = 'menu-toggle';
        toggle.textContent = '☰';
        toggle.onclick = () => {
            document.getElementById('sidebar').classList.toggle('open');
        };
        document.querySelector('.top-header').prepend(toggle);
    },

    // ===== MODALS =====
    setupModals() {
        const overlay = document.getElementById('modal-overlay');
        const close = document.getElementById('modal-close');

        close.addEventListener('click', () => {
            overlay.classList.remove('active');
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    },

    openModal(title, content) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('modal-overlay').classList.add('active');
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    },

    // ===== PAGE LOADER =====
    async loadPage(page) {
        this.currentPage = page;
        document.getElementById('page-title').textContent = this.getPageTitle(page);
        const container = document.getElementById('page-content');

        container.innerHTML = '<div class="loading">Loading</div>';

        try {
            let content = '';
            switch (page) {
                case 'dashboard':
                    content = await this.renderDashboard();
                    break;
                case 'vote-heads':
                    content = await this.renderVoteHeads();
                    break;
                case 'fee-structures':
                    content = await this.renderFeeStructures();
                    break;
                case 'enrollments':
                    content = await this.renderEnrollments();
                    break;
                case 'payments':
                    content = await this.renderPayments();
                    break;
                case 'students':
                    content = await this.renderStudents();
                    break;
                case 'receipts':
                    content = await this.renderReceipts();
                    break;
                case 'reports':
                    content = await this.renderReports();
                    break;
                case 'audit-logs':
                    content = await this.renderAuditLogs();
                    break;
                default:
                    content = '<p>Page not found</p>';
            }
            container.innerHTML = content;
        } catch (error) {
            container.innerHTML = `
                <div class="error-box">
                    <strong>Error:</strong> ${error.message}
                </div>
            `;
            console.error('Page load error:', error);
        }
    },

    getPageTitle(page) {
        const titles = {
            dashboard: 'Dashboard',
            'vote-heads': 'Vote Heads',
            'fee-structures': 'Fee Structures',
            enrollments: 'Enrollments',
            payments: 'Payments',
            students: 'Students',
            receipts: 'Receipts',
            reports: 'Reports',
            'audit-logs': 'Audit Logs',
        };
        return titles[page] || page;
    },

    // ===== CLOCK =====
    updateClock() {
        const now = new Date();
        document.getElementById('current-time').textContent = now.toLocaleString();
    },

    // ===== API STATUS =====
    async checkApiStatus() {
        try {
            const response = await fetch('/api/health');
            if (response.ok) {
                document.getElementById('api-status').className = 'status-badge status-online';
                document.getElementById('api-status').textContent = 'Online';
            } else {
                throw new Error('API down');
            }
        } catch (error) {
            document.getElementById('api-status').className = 'status-badge status-offline';
            document.getElementById('api-status').textContent = 'Offline';
        }
    },

    // ============================================================
    // ===== PAGE RENDERERS =====
    // ============================================================

    // ----- DASHBOARD -----
    async renderDashboard() {
        try {
            const [outstanding, stats, daily] = await Promise.all([
                api.getOutstanding(),
                api.getAuditLogStats(),
                api.getDailyCollection(new Date().toISOString().split('T')[0]),
            ]);

            const totalOutstanding = outstanding.data?.reduce((sum, s) => sum + parseFloat(s.total_outstanding || 0), 0) || 0;

            return `
                <div class="card-grid">
                    <div class="stat-card">
                        <div class="label">Total Outstanding</div>
                        <div class="value">KES ${totalOutstanding.toFixed(2)}</div>
                        <div class="sub">${outstanding.data?.length || 0} students</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Today's Collections</div>
                        <div class="value">KES ${daily.data?.summary?.totalCollected?.toFixed(2) || '0.00'}</div>
                        <div class="sub">${daily.data?.summary?.totalTransactions || 0} transactions</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Total Audit Logs</div>
                        <div class="value">${stats.data?.total || 0}</div>
                        <div class="sub">${stats.data?.today || 0} today</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">System Status</div>
                        <div class="value" style="font-size:16px;">Operational</div>
                        <div class="sub">All services running</div>
                    </div>
                </div>

                <h3>Quick Actions</h3>
                <div class="btn-group mt-16">
                    <button class="btn btn-primary" onclick="App.navigateTo('enrollments')">New Enrollment</button>
                    <button class="btn btn-success" onclick="App.navigateTo('payments')">Post Payment</button>
                    <button class="btn btn-warning" onclick="App.navigateTo('receipts')">Generate Receipt</button>
                    <button class="btn btn-info" onclick="App.navigateTo('reports')">View Reports</button>
                </div>

                <h3 class="mt-16">Recent Activity</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Entity</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.data?.recent?.slice(0, 5).map(log => `
                                <tr>
                                    <td>${new Date(log.created_at).toLocaleString()}</td>
                                    <td>${log.user_id}</td>
                                    <td><span class="badge badge-info">${log.action}</span></td>
                                    <td>${log.entity_type}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" class="text-center">No recent activity</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (error) {
            return `<div class="error-box">Error loading dashboard: ${error.message}</div>`;
        }
    },

    // ----- VOTE HEADS -----
    async renderVoteHeads() {
        const data = await api.getVoteHeads();
        const voteHeads = data.data || [];

        return `
            <div class="flex flex-between mb-16">
                <h3>Manage Vote Heads</h3>
                <button class="btn btn-primary" onclick="App.showCreateVoteHead()">+ New Vote Head</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>One-Time</th>
                            <th>Refundable</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${voteHeads.map(vh => `
                            <tr>
                                <td><code>${vh.id}</code></td>
                                <td>${vh.name}</td>
                                <td>${vh.is_one_time ? 'Yes' : 'No'}</td>
                                <td>${vh.is_refundable ? 'Yes' : 'No'}</td>
                                <td>${vh.priority_order}</td>
                                <td><span class="badge ${vh.is_active ? 'badge-success' : 'badge-danger'}">${vh.is_active ? 'Active' : 'Inactive'}</span></td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-warning" onclick="App.showEditVoteHead('${vh.id}')">Edit</button>
                                        <button class="btn btn-sm ${vh.is_active ? 'btn-danger' : 'btn-success'}" onclick="App.toggleVoteHead('${vh.id}')">${vh.is_active ? 'Deactivate' : 'Activate'}</button>
                                        <button class="btn btn-sm btn-danger" onclick="App.deleteVoteHead('${vh.id}')">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // ----- FEE STRUCTURES -----
    async renderFeeStructures() {
        const data = await api.getFeeStructures();
        const structures = data.data || [];

        return `
            <div class="flex flex-between mb-16">
                <h3>Fee Structures</h3>
                <div class="btn-group">
                    <button class="btn btn-primary" onclick="App.showCreateFeeStructure()">+ New Structure</button>
                    <button class="btn btn-info" onclick="App.showBulkCreateFeeStructure()">Bulk Create</button>
                    <button class="btn btn-secondary" onclick="App.loadPage('fee-structures')">Refresh</button>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Version</th>
                            <th>Term</th>
                            <th>Scope</th>
                            <th>Valid From</th>
                            <th>Valid To</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${structures.map(fs => `
                            <tr>
                                <td><code>${fs.id}</code></td>
                                <td>${fs.version_label}</td>
                                <td>${fs.term_number}</td>
                                <td>${fs.scope_type}</td>
                                <td>${fs.valid_from}</td>
                                <td>${fs.valid_to || '∞'}</td>
                                <td>KES ${parseFloat(fs.total_amount).toFixed(2)}</td>
                                <td><span class="badge ${fs.is_active ? 'badge-success' : 'badge-danger'}">${fs.is_active ? 'Active' : 'Closed'}</span></td>
                                <td>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-warning" onclick="App.showEditFeeStructure('${fs.id}')">Edit</button>
                                        ${fs.is_active ? `<button class="btn btn-sm btn-danger" onclick="App.closeFeeStructure('${fs.id}')">Close</button>` : ''}
                                        <button class="btn btn-sm btn-info" onclick="App.showCopyFeeStructure('${fs.id}')">Copy</button>
                                        <button class="btn btn-sm btn-danger" onclick="App.deleteFeeStructure('${fs.id}')">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // ----- ENROLLMENTS (Search by Registration Number) -----
    async renderEnrollments() {
        return `
            <div class="flex flex-between mb-16">
                <h3>Enrollments</h3>
                <button class="btn btn-primary" onclick="App.showCreateEnrollment()">+ New Enrollment</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Search by Registration Number</label>
                    <input type="text" id="enrollment-search" placeholder="e.g., 2026-ICT-001 or 2026/ICT/001" />
                </div>
                <div class="form-group" style="display:flex;align-items:flex-end;">
                    <button class="btn btn-primary" onclick="App.searchEnrollments()">Search</button>
                </div>
            </div>
            <div id="enrollment-results">
                <p class="text-center" style="color:#999;">Enter a registration number to view enrollments</p>
            </div>
        `;
    },

    async searchEnrollments() {
        const regNo = document.getElementById('enrollment-search').value.trim();
        if (!regNo) {
            document.getElementById('enrollment-results').innerHTML = '<p class="text-center" style="color:#999;">Please enter a Registration Number</p>';
            return;
        }

        try {
            const data = await api.getEnrollmentsByRegNo(regNo);
            const enrollments = data.data || [];

            if (enrollments.length === 0) {
                document.getElementById('enrollment-results').innerHTML = `<p class="text-center" style="color:#999;">No enrollments found for ${regNo}</p>`;
                return;
            }

            let html = `
                <div class="table-container">
                    <h4>Enrollments for ${regNo}</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Enrollment ID</th>
                                <th>Student Name</th>
                                <th>Term</th>
                                <th>Status</th>
                                <th>Obligations</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            for (const enrollment of enrollments) {
                const obligations = enrollment.obligations || [];
                const studentName = enrollment.student_name || 'N/A';
                html += `
                    <tr>
                        <td><code>${enrollment.id}</code></td>
                        <td>${studentName}</td>
                        <td>Year ${enrollment.student_year}, Term ${enrollment.student_term}</td>
                        <td><span class="badge ${enrollment.status === 'active' ? 'badge-success' : 'badge-warning'}">${enrollment.status}</span></td>
                        <td>${obligations.length}</td>
                        <td>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-info" onclick="App.viewObligations('${enrollment.id}')">View</button>
                                ${enrollment.status === 'active' ? `<button class="btn btn-sm btn-warning" onclick="App.updateEnrollmentStatus('${enrollment.id}')">Update Status</button>` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            }

            html += '</tbody></table></div>';
            document.getElementById('enrollment-results').innerHTML = html;
        } catch (error) {
            document.getElementById('enrollment-results').innerHTML = `<div class="error-box">Error: ${error.message}</div>`;
        }
    },

    // ----- PAYMENTS (Search by Reg No + Select Obligation) -----
    async renderPayments() {
        return `
            <div class="flex flex-between mb-16">
                <h3>Payments</h3>
                <button class="btn btn-primary" onclick="App.showPostPayment()">+ Post Payment</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Search by Registration Number</label>
                    <input type="text" id="payment-search" placeholder="e.g., 2026-ICT-001 or 2026/ICT/001" />
                </div>
                <div class="form-group" style="display:flex;align-items:flex-end;">
                    <button class="btn btn-primary" onclick="App.searchPayments()">Search</button>
                </div>
            </div>

            <!-- Obligation Selector for Payment (inline, used by the "Pay" button in search results) -->
            <div id="payment-obligation-selector" style="display:none; margin-top:20px; border-top:1px solid #eee; padding-top:20px;">
                <h4 id="payment-student-display"></h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>Select Obligation to Pay</label>
                        <select id="payment-obligation-select" style="width:100%; padding:8px 12px; border:1px solid #ddd; border-radius:6px;">
                            <option value="">-- Select Obligation --</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Amount to Pay</label>
                        <input type="number" step="0.01" id="payment-amount-input" placeholder="Enter amount" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Payment Mode</label>
                        <select id="inline-pay-mode">
                            <option value="cash">Cash</option>
                            <option value="mpesa">M-Pesa</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Funding Source</label>
                        <select id="inline-pay-source">
                            <option value="self">Self</option>
                            <option value="kuccps">KUCCPS</option>
                            <option value="nita">NITA</option>
                            <option value="helb">HELB</option>
                            <option value="employer">Employer</option>
                            <option value="cdf_bursary">CDF Bursary</option>
                            <option value="county_bursary">County Bursary</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Transaction Reference</label>
                        <input type="text" id="inline-pay-txn-ref" placeholder="e.g., PAY-001" />
                    </div>
                    <div class="form-group">
                        <label>Payment Date</label>
                        <input type="date" id="inline-pay-date" />
                    </div>
                </div>
                <div class="form-group">
                    <label>Received By</label>
                    <input type="text" id="inline-pay-received-by" placeholder="e.g., CASHIER-01" />
                </div>
                <div class="btn-group mt-16">
                    <button class="btn btn-success" onclick="App.submitPaymentFromSelector()">Post Payment</button>
                    <button class="btn btn-secondary" onclick="document.getElementById('payment-obligation-selector').style.display='none'">Cancel</button>
                </div>
                <div id="payment-result" style="margin-top:16px;"></div>
            </div>

            <div id="payment-results">
                <p class="text-center" style="color:#999;">Enter a registration number to view payments</p>
            </div>
        `;
    },

    async searchPayments() {
        const regNo = document.getElementById('payment-search').value.trim();
        if (!regNo) {
            document.getElementById('payment-results').innerHTML = '<p class="text-center" style="color:#999;">Please enter a Registration Number</p>';
            return;
        }

        try {
            // Get the student's fee position to show obligations
            const positionData = await api.getStudentFeePosition(regNo);
            const position = positionData.data;

            if (!position || !position.found) {
                document.getElementById('payment-results').innerHTML = `
                    <div class="error-box">Student "${regNo}" not found. Please check the registration number.</div>
                `;
                return;
            }

            const obligations = position.obligations || [];
            const summary = position.summary || {};
            const studentName = position.studentName || 'N/A';
            const studentRegNo = position.regNo || regNo;

            let html = `
                <div class="card-grid" style="margin-top:16px;">
                    <div class="stat-card">
                        <div class="label">Student</div>
                        <div class="value" style="font-size:16px;">${studentName}</div>
                        <div class="sub">${studentRegNo} | ${position.programmeCode || 'N/A'}</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Total Balance</div>
                        <div class="value">KES ${(summary.totalBalance || 0).toFixed(2)}</div>
                        <div class="sub">${obligations.length} obligations</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Total Paid</div>
                        <div class="value" style="color:#28a745;">KES ${(summary.totalPaid || 0).toFixed(2)}</div>
                        <div class="sub">Credit: KES ${(summary.creditOnAccount || 0).toFixed(2)}</div>
                    </div>
                </div>
            `;

            if (obligations.length > 0) {
                html += `
                    <h4 style="margin-top:16px;">Obligations</h4>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Obligation ID</th>
                                    <th>Type</th>
                                    <th>Term</th>
                                    <th>Total</th>
                                    <th>Paid</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${obligations.map(ob => `
                                    <tr>
                                        <td><code>${ob.obligationId}</code></td>
                                        <td>${ob.type}</td>
                                        <td>${ob.studentTerm}</td>
                                        <td>KES ${ob.totalAmount.toFixed(2)}</td>
                                        <td>KES ${ob.totalPaid.toFixed(2)}</td>
                                        <td>KES ${ob.totalBalance.toFixed(2)}</td>
                                        <td><span class="badge ${ob.status === 'cleared' ? 'badge-success' : ob.status === 'partial' ? 'badge-warning' : 'badge-danger'}">${ob.status}</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="App.selectObligationForPayment('${ob.obligationId}', '${studentName}', '${studentRegNo}', ${ob.totalBalance})">
                                                Pay
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;

                // Show recent payments if any
                const paymentsData = await api.getPaymentsByRegNo(regNo);
                const payments = paymentsData.data || [];
                if (payments.length > 0) {
                    html += `
                        <h4 style="margin-top:16px;">Recent Payments</h4>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Receipt</th>
                                        <th>Amount</th>
                                        <th>Mode</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${payments.slice(0, 5).map(p => `
                                        <tr>
                                            <td><code>${p.receipt_number}</code></td>
                                            <td>KES ${parseFloat(p.total_amount).toFixed(2)}</td>
                                            <td>${p.payment_mode}</td>
                                            <td>${p.payment_date}</td>
                                            <td>
                                                <button class="btn btn-sm btn-danger" onclick="App.reversePayment('${p.id}')">Reverse</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                }
            } else {
                html += `<p class="text-center" style="color:#999; margin-top:16px;">No obligations found for this student</p>`;
            }

            document.getElementById('payment-results').innerHTML = html;
            document.getElementById('payment-obligation-selector').style.display = 'none';

        } catch (error) {
            document.getElementById('payment-results').innerHTML = `<div class="error-box">Error: ${error.message}</div>`;
        }
    },

    selectObligationForPayment(obligationId, studentName, studentRegNo, balance) {
        const selector = document.getElementById('payment-obligation-selector');
        selector.style.display = 'block';

        document.getElementById('payment-student-display').textContent =
            `Student: ${studentName} (${studentRegNo}) | Balance: KES ${balance.toFixed(2)}`;

        const select = document.getElementById('payment-obligation-select');
        select.innerHTML = `
            <option value="${obligationId}">${obligationId} - Balance: KES ${balance.toFixed(2)}</option>
        `;

        document.getElementById('payment-amount-input').value = balance;

        if (!document.getElementById('inline-pay-date').value) {
            document.getElementById('inline-pay-date').value = new Date().toISOString().split('T')[0];
        }

        document.getElementById('payment-result').innerHTML = '';
        selector.scrollIntoView({ behavior: 'smooth' });
    },

    async submitPaymentFromSelector() {
        const obligationId = document.getElementById('payment-obligation-select').value;
        const amount = parseFloat(document.getElementById('payment-amount-input').value);
        const paymentMode = document.getElementById('inline-pay-mode').value;
        const fundingSource = document.getElementById('inline-pay-source').value;
        const transactionRef = document.getElementById('inline-pay-txn-ref').value.trim() || undefined;
        const receivedBy = document.getElementById('inline-pay-received-by').value.trim();
        const paymentDate = document.getElementById('inline-pay-date').value;

        const displayText = document.getElementById('payment-student-display').textContent;
        const regNoMatch = displayText.match(/\(([^)]+)\)/);
        const regNo = regNoMatch ? regNoMatch[1] : null;

        const resultContainer = document.getElementById('payment-result');

        if (!obligationId) {
            resultContainer.innerHTML = '<div class="error-box">Please select an obligation</div>';
            return;
        }

        if (!amount || amount <= 0) {
            resultContainer.innerHTML = '<div class="error-box">Please enter a valid amount</div>';
            return;
        }

        if (!receivedBy) {
            resultContainer.innerHTML = '<div class="error-box">Please enter who received the payment</div>';
            return;
        }

        if (!paymentDate) {
            resultContainer.innerHTML = '<div class="error-box">Please select a payment date</div>';
            return;
        }

        resultContainer.innerHTML = '<div class="loading">Posting payment...</div>';

        try {
            const data = {
                regNo: regNo,
                obligations: [
                    {
                        obligationId: obligationId,
                        amount: amount
                    }
                ],
                totalAmount: amount,
                paymentMode: paymentMode,
                transactionRef: transactionRef,
                fundingSource: fundingSource,
                receivedBy: receivedBy,
                paymentDate: paymentDate,
            };

            const response = await api.postPayment(data);

            resultContainer.innerHTML = `
                <div style="background:#d4edda;padding:15px;border-radius:6px;border:1px solid #c3e6cb;color:#155724;">
                    <strong>✅ Payment posted successfully!</strong><br>
                    Receipt Number: <strong>${response.data.payment.receipt_number}</strong><br>
                    Amount: KES ${response.data.payment.total_amount}<br>
                    Balance: KES ${response.data.obligationResults[0]?.newBalance?.toFixed(2) || '0.00'}
                </div>
            `;

            setTimeout(() => {
                document.getElementById('payment-search').value = regNo;
                this.searchPayments();
            }, 2000);

        } catch (error) {
            resultContainer.innerHTML = `<div class="error-box">Error: ${error.message}</div>`;
        }
    },

    // ----- STUDENTS (View Fee Position by Registration Number) -----
    async renderStudents() {
        return `
            <div class="flex flex-between mb-16">
                <h3>Student Fee Position</h3>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Registration Number</label>
                    <input type="text" id="student-reg-input" placeholder="e.g., 2026-ICT-001 or 2026/ICT/001" />
                </div>
                <div class="form-group">
                    <label>Year (Optional)</label>
                    <input type="number" id="student-year-input" placeholder="e.g., 1" />
                </div>
                <div class="form-group" style="display:flex;align-items:flex-end;">
                    <button class="btn btn-primary" onclick="App.viewStudentFeePosition()">View Position</button>
                </div>
            </div>
            <div id="student-position-results">
                <p class="text-center" style="color:#999;">Enter a registration number to view fee position</p>
            </div>
        `;
    },

    async viewStudentFeePosition() {
        const regNo = document.getElementById('student-reg-input').value.trim();
        const year = document.getElementById('student-year-input').value.trim();

        if (!regNo) {
            document.getElementById('student-position-results').innerHTML = '<p class="text-center" style="color:#999;">Please enter a Registration Number</p>';
            return;
        }

        try {
            const data = await api.getStudentFeePosition(regNo, year || null);
            const position = data.data;

            if (!position || !position.found) {
                document.getElementById('student-position-results').innerHTML = `<p class="text-center" style="color:#999;">Student ${regNo} not found</p>`;
                return;
            }

            const summary = position.summary || {};
            const obligations = position.obligations || [];
            const studentName = position.studentName || 'N/A';
            const studentRegNo = position.regNo || regNo;

            let html = `
                <div class="card-grid">
                    <div class="stat-card">
                        <div class="label">Student</div>
                        <div class="value" style="font-size:16px;">${studentName}</div>
                        <div class="sub">${studentRegNo} | ${position.programmeCode || 'N/A'}</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Total Balance</div>
                        <div class="value">KES ${(summary.totalBalance || 0).toFixed(2)}</div>
                        <div class="sub">${summary.grandTotal || 0} total fees</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Total Paid</div>
                        <div class="value" style="color:#28a745;">KES ${(summary.totalPaid || 0).toFixed(2)}</div>
                        <div class="sub">${position.obligationCount || 0} obligations</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Credit on Account</div>
                        <div class="value" style="color:#17a2b8;">KES ${(summary.creditOnAccount || 0).toFixed(2)}</div>
                        <div class="sub">${position.enrollmentCount || 0} enrollments</div>
                    </div>
                </div>

                <h4>Obligations</h4>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Term</th>
                                <th>Total</th>
                                <th>Paid</th>
                                <th>Balance</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${obligations.map(ob => `
                                <tr>
                                    <td>${ob.type}</td>
                                    <td>${ob.studentTerm}</td>
                                    <td>KES ${ob.totalAmount.toFixed(2)}</td>
                                    <td>KES ${ob.totalPaid.toFixed(2)}</td>
                                    <td>KES ${ob.totalBalance.toFixed(2)}</td>
                                    <td><span class="badge ${ob.status === 'cleared' ? 'badge-success' : ob.status === 'partial' ? 'badge-warning' : 'badge-danger'}">${ob.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            document.getElementById('student-position-results').innerHTML = html;
        } catch (error) {
            document.getElementById('student-position-results').innerHTML = `<div class="error-box">Error: ${error.message}</div>`;
        }
    },

    // ----- RECEIPTS (Search by Registration Number) -----
    async renderReceipts() {
        return `
            <div class="flex flex-between mb-16">
                <h3>Generate Receipt</h3>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Search by Registration Number</label>
                    <input type="text" id="receipt-student-search" placeholder="e.g., 2026-ICT-001 or 2026/ICT/001" />
                </div>
                <div class="form-group" style="display:flex;align-items:flex-end;">
                    <button class="btn btn-primary" onclick="App.searchStudentForReceipt()">Search</button>
                </div>
            </div>

            <div id="receipt-student-results">
                <p class="text-center" style="color:#999;">Search for a student by registration number</p>
            </div>

            <div id="receipt-obligation-selector" style="display:none; margin-top:20px; border-top:1px solid #eee; padding-top:20px;">
                <h4 id="receipt-student-name-display"></h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>Select Obligation</label>
                        <select id="receipt-obligation-select" style="width:100%; padding:8px 12px; border:1px solid #ddd; border-radius:6px;">
                            <option value="">-- Select Obligation --</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Receipt Type</label>
                        <select id="receipt-type">
                            <option value="student">Student Receipt (Full Details)</option>
                            <option value="sponsor">Sponsor Receipt (Summary)</option>
                        </select>
                    </div>
                </div>
                <div class="btn-group mt-16">
                    <button class="btn btn-success" onclick="App.generateReceiptFromSelection()">Generate Receipt</button>
                    <button class="btn btn-secondary" onclick="document.getElementById('receipt-obligation-selector').style.display='none'">Cancel</button>
                </div>
                <div id="receipt-results" style="margin-top:16px;"></div>
            </div>
        `;
    },

    async searchStudentForReceipt() {
        const searchTerm = document.getElementById('receipt-student-search').value.trim();
        if (!searchTerm) {
            document.getElementById('receipt-student-results').innerHTML = '<p class="text-center" style="color:#999;">Please enter a registration number</p>';
            return;
        }

        try {
            const data = await api.getStudentFeePosition(searchTerm);
            const position = data.data;

            if (!position || !position.found) {
                document.getElementById('receipt-student-results').innerHTML = `
                    <div class="error-box">Student "${searchTerm}" not found. Please check the registration number.</div>
                `;
                return;
            }

            const obligations = position.obligations || [];
            const summary = position.summary || {};
            const studentName = position.studentName || 'N/A';
            const studentRegNo = position.regNo || searchTerm;

            let html = `
                <div class="card-grid" style="margin-top:16px;">
                    <div class="stat-card">
                        <div class="label">Student</div>
                        <div class="value" style="font-size:16px;">${studentName}</div>
                        <div class="sub">${studentRegNo} | ${position.programmeCode || 'N/A'}</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Total Balance</div>
                        <div class="value">KES ${(summary.totalBalance || 0).toFixed(2)}</div>
                        <div class="sub">${obligations.length} obligations</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Total Paid</div>
                        <div class="value" style="color:#28a745;">KES ${(summary.totalPaid || 0).toFixed(2)}</div>
                        <div class="sub">Credit: KES ${(summary.creditOnAccount || 0).toFixed(2)}</div>
                    </div>
                </div>
            `;

            if (obligations.length > 0) {
                html += `
                    <h4 style="margin-top:16px;">Obligations</h4>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Obligation ID</th>
                                    <th>Type</th>
                                    <th>Term</th>
                                    <th>Total</th>
                                    <th>Paid</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${obligations.map(ob => `
                                    <tr>
                                        <td><code>${ob.obligationId}</code></td>
                                        <td>${ob.type}</td>
                                        <td>${ob.studentTerm}</td>
                                        <td>KES ${ob.totalAmount.toFixed(2)}</td>
                                        <td>KES ${ob.totalPaid.toFixed(2)}</td>
                                        <td>KES ${ob.totalBalance.toFixed(2)}</td>
                                        <td><span class="badge ${ob.status === 'cleared' ? 'badge-success' : ob.status === 'partial' ? 'badge-warning' : 'badge-danger'}">${ob.status}</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="App.selectObligationForReceipt('${ob.obligationId}', '${studentName}', '${studentRegNo}')">
                                                Select
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                html += `<p class="text-center" style="color:#999; margin-top:16px;">No obligations found for this student</p>`;
            }

            document.getElementById('receipt-student-results').innerHTML = html;
        } catch (error) {
            document.getElementById('receipt-student-results').innerHTML = `<div class="error-box">Error: ${error.message}</div>`;
        }
    },

    selectObligationForReceipt(obligationId, studentName, studentRegNo) {
        const selector = document.getElementById('receipt-obligation-selector');
        selector.style.display = 'block';

        document.getElementById('receipt-student-name-display').textContent =
            `Selected Student: ${studentName} (${studentRegNo})`;

        const select = document.getElementById('receipt-obligation-select');
        select.innerHTML = `
            <option value="${obligationId}">${obligationId}</option>
        `;

        document.getElementById('receipt-results').innerHTML = '';
        selector.scrollIntoView({ behavior: 'smooth' });
    },

    async generateReceiptFromSelection() {
        const obligationId = document.getElementById('receipt-obligation-select').value;
        const type = document.getElementById('receipt-type').value;

        if (!obligationId) {
            document.getElementById('receipt-results').innerHTML = '<p class="text-center" style="color:#999;">Please select an obligation</p>';
            return;
        }

        const resultsContainer = document.getElementById('receipt-results');
        resultsContainer.innerHTML = '<div class="loading">Generating receipt...</div>';

        try {
            const data = await api.getReceiptJson(obligationId);
            const receipt = data.data;

            if (!receipt) {
                resultsContainer.innerHTML = '<p class="text-center" style="color:#999;">No receipt data found</p>';
                return;
            }

            let html = `
                <div class="card-grid" style="margin-top:16px;">
                    <div class="stat-card">
                        <div class="label">Receipt Number</div>
                        <div class="value" style="font-size:16px;">${receipt.receiptNumber}</div>
                        <div class="sub">${receipt.generatedDate}</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Student</div>
                        <div class="value" style="font-size:16px;">${receipt.studentName || receipt.regNo}</div>
                        <div class="sub">${receipt.regNo || 'N/A'}</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Total Amount</div>
                        <div class="value">KES ${receipt.totalAmount.toFixed(2)}</div>
                        <div class="sub">${receipt.obligationType}</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Status</div>
                        <div class="value" style="font-size:16px;">
                            <span class="badge ${receipt.status === 'cleared' ? 'badge-success' : receipt.status === 'partial' ? 'badge-warning' : 'badge-danger'}">
                                ${receipt.status}
                            </span>
                        </div>
                        <div class="sub">Balance: KES ${receipt.totalBalance.toFixed(2)}</div>
                    </div>
                </div>

                <div class="btn-group mt-16">
                    <button class="btn btn-success" onclick="App.downloadReceipt('${obligationId}', '${type}')">Download PDF</button>
                    <button class="btn btn-primary" onclick="App.viewReceiptJson('${obligationId}')">View JSON</button>
                    <button class="btn btn-secondary" onclick="App.generateAnotherReceipt()">Generate Another</button>
                </div>

                <div id="receipt-json-container" style="display:none;margin-top:16px;">
                    <div class="json-view" id="receipt-json-content"></div>
                </div>
            `;

            resultsContainer.innerHTML = html;
        } catch (error) {
            resultsContainer.innerHTML = `<div class="error-box">Error: ${error.message}</div>`;
        }
    },

    generateAnotherReceipt() {
        document.getElementById('receipt-obligation-selector').style.display = 'none';
        document.getElementById('receipt-student-results').innerHTML = '';
        document.getElementById('receipt-student-search').value = '';
        document.getElementById('receipt-results').innerHTML = '';
        document.getElementById('receipt-student-search').focus();
    },

    downloadReceipt(obligationId, type) {
        api.generateReceipt(obligationId, type);
    },

    async viewReceiptJson(obligationId) {
        const container = document.getElementById('receipt-json-container');
        const content = document.getElementById('receipt-json-content');

        if (container.style.display === 'block') {
            container.style.display = 'none';
            return;
        }

        try {
            const data = await api.getReceiptJson(obligationId);
            content.textContent = JSON.stringify(data.data, null, 2);
            container.style.display = 'block';
        } catch (error) {
            content.textContent = `Error: ${error.message}`;
            container.style.display = 'block';
        }
    },

    // ----- REPORTS -----
    async renderReports() {
        const today = new Date().toISOString().split('T')[0];
        const monthStart = new Date(today);
        monthStart.setDate(1);

        try {
            const [daily, monthly, aging] = await Promise.all([
                api.getDailyCollection(today),
                api.getMonthlySummary(monthStart.getFullYear(), monthStart.getMonth() + 1),
                api.getAgingReport(),
            ]);

            return `
                <h3>Reports Dashboard</h3>

                <div class="card-grid">
                    <div class="stat-card">
                        <div class="label">Today's Collection</div>
                        <div class="value">KES ${daily.data?.summary?.totalCollected?.toFixed(2) || '0.00'}</div>
                        <div class="sub">${daily.data?.summary?.totalTransactions || 0} transactions</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Month-to-Date</div>
                        <div class="value">KES ${monthly.data?.summary?.totalCollected?.toFixed(2) || '0.00'}</div>
                        <div class="sub">${monthly.data?.summary?.totalTransactions || 0} transactions</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Total Outstanding</div>
                        <div class="value">KES ${aging.data?.totalOutstanding?.toFixed(2) || '0.00'}</div>
                        <div class="sub">${aging.data?.totalStudents || 0} students</div>
                    </div>
                    <div class="stat-card">
                        <div class="label">Overdue (90+ days)</div>
                        <div class="value">KES ${aging.data?.agingBuckets?.['90+']?.total?.toFixed(2) || '0.00'}</div>
                        <div class="sub">${aging.data?.agingBuckets?.['90+']?.count || 0} obligations</div>
                    </div>
                </div>

                <div class="btn-group mt-16">
                    <button class="btn btn-primary" onclick="App.showReportDetail('daily')">Daily Detail</button>
                    <button class="btn btn-primary" onclick="App.showReportDetail('monthly')">Monthly Detail</button>
                    <button class="btn btn-primary" onclick="App.showReportDetail('aging')">Aging Detail</button>
                    <button class="btn btn-primary" onclick="App.showReportDetail('programme')">Programme Collection</button>
                </div>

                <div id="report-detail-container" style="margin-top:16px;">
                    <p class="text-center" style="color:#999;">Click a button above to view detailed report</p>
                </div>
            `;
        } catch (error) {
            return `<div class="error-box">Error loading reports: ${error.message}</div>`;
        }
    },

    async showReportDetail(type) {
        const container = document.getElementById('report-detail-container');
        container.innerHTML = '<div class="loading">Loading</div>';

        try {
            let html = '';
            const today = new Date().toISOString().split('T')[0];

            switch (type) {
                case 'daily': {
                    const data = await api.getDailyCollection(today);
                    const report = data.data;
                    html = `
                        <h4>Daily Collection - ${report.date}</h4>
                        <div class="card-grid">
                            <div class="stat-card">
                                <div class="label">Total Collected</div>
                                <div class="value">KES ${report.summary.totalCollected.toFixed(2)}</div>
                            </div>
                            <div class="stat-card">
                                <div class="label">Transactions</div>
                                <div class="value">${report.summary.totalTransactions}</div>
                            </div>
                            <div class="stat-card">
                                <div class="label">Average</div>
                                <div class="value">KES ${report.summary.averageTransaction.toFixed(2)}</div>
                            </div>
                        </div>
                        <h5>By Payment Mode</h5>
                        <div class="table-container">
                            <table>
                                <thead><tr><th>Mode</th><th>Count</th><th>Total</th></tr></thead>
                                <tbody>
                                    ${Object.entries(report.byPaymentMode || {}).map(([mode, data]) => `
                                        <tr><td>${mode}</td><td>${data.count}</td><td>KES ${data.total.toFixed(2)}</td></tr>
                                    `).join('') || '<tr><td colspan="3">No data</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    `;
                    break;
                }
                case 'monthly': {
                    const monthStart = new Date(today);
                    monthStart.setDate(1);
                    const data = await api.getMonthlySummary(monthStart.getFullYear(), monthStart.getMonth() + 1);
                    const report = data.data;
                    html = `
                        <h4>Monthly Summary - ${report.month}</h4>
                        <div class="card-grid">
                            <div class="stat-card">
                                <div class="label">Total Collected</div>
                                <div class="value">KES ${report.summary.totalCollected.toFixed(2)}</div>
                            </div>
                            <div class="stat-card">
                                <div class="label">Transactions</div>
                                <div class="value">${report.summary.totalTransactions}</div>
                            </div>
                        </div>
                        <h5>Weekly Breakdown</h5>
                        <div class="table-container">
                            <table>
                                <thead><tr><th>Week</th><th>Count</th><th>Total</th></tr></thead>
                                <tbody>
                                    ${Object.entries(report.weeklyBreakdown || {}).map(([week, data]) => `
                                        <tr><td>${week}</td><td>${data.count}</td><td>KES ${data.total.toFixed(2)}</td></tr>
                                    `).join('') || '<tr><td colspan="3">No data</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    `;
                    break;
                }
                case 'aging': {
                    const data = await api.getAgingReport();
                    const report = data.data;
                    html = `
                        <h4>Aging Report</h4>
                        <div class="card-grid">
                            <div class="stat-card">
                                <div class="label">Total Outstanding</div>
                                <div class="value">KES ${report.totalOutstanding.toFixed(2)}</div>
                            </div>
                            <div class="stat-card">
                                <div class="label">Students with Balance</div>
                                <div class="value">${report.totalStudents}</div>
                            </div>
                        </div>
                        <h5>Aging Buckets</h5>
                        <div class="table-container">
                            <table>
                                <thead><tr><th>Bucket</th><th>Count</th><th>Total</th><th>Students</th></tr></thead>
                                <tbody>
                                    ${Object.entries(report.agingBuckets || {}).map(([bucket, data]) => `
                                        <tr>
                                            <td>${bucket} days</td>
                                            <td>${data.count}</td>
                                            <td>KES ${data.total.toFixed(2)}</td>
                                            <td>${data.students?.length || 0}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                    break;
                }
                case 'programme': {
                    const monthStart = new Date(today);
                    monthStart.setDate(1);
                    const data = await api.getProgrammeCollection(monthStart.toISOString().split('T')[0], today);
                    const report = data.data;
                    html = `
                        <h4>Programme Collection</h4>
                        <div class="card-grid">
                            <div class="stat-card">
                                <div class="label">Total Collected</div>
                                <div class="value">KES ${report.summary.totalCollected.toFixed(2)}</div>
                            </div>
                            <div class="stat-card">
                                <div class="label">Programmes</div>
                                <div class="value">${report.summary.totalProgrammes}</div>
                            </div>
                        </div>
                        <div class="table-container">
                            <table>
                                <thead><tr><th>Programme</th><th>Students</th><th>Transactions</th><th>Total Paid</th></tr></thead>
                                <tbody>
                                    ${(report.programmes || []).map(p => `
                                        <tr>
                                            <td>${p.programmeCode}</td>
                                            <td>${p.studentCount || 0}</td>
                                            <td>${p.transactionCount || 0}</td>
                                            <td>KES ${p.totalPaid.toFixed(2)}</td>
                                        </tr>
                                    `).join('') || '<tr><td colspan="4">No data</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    `;
                    break;
                }
            }

            container.innerHTML = html;
        } catch (error) {
            container.innerHTML = `<div class="error-box">Error: ${error.message}</div>`;
        }
    },

    // ----- AUDIT LOGS -----
    async renderAuditLogs() {
        try {
            const data = await api.getAuditLogs({ limit: 100 });
            const logs = data.data || [];

            return `
                <div class="flex flex-between mb-16">
                    <h3>Audit Logs</h3>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-primary" onclick="App.loadPage('audit-logs')">Refresh</button>
                        <button class="btn btn-sm btn-info" onclick="App.showAuditFilters()">Filter</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Entity</th>
                                <th>Entity ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${logs.map(log => `
                                <tr>
                                    <td>${new Date(log.created_at).toLocaleString()}</td>
                                    <td>${log.user_id}</td>
                                    <td><span class="badge badge-info">${log.action}</span></td>
                                    <td>${log.entity_type}</td>
                                    <td><code>${log.entity_id}</code></td>
                                </tr>
                            `).join('') || '<tr><td colspan="5" class="text-center">No audit logs found</td></tr>'}
                        </tbody>
                    </table>
                </div>
                <div style="margin-top:16px;font-size:14px;color:#666;">
                    Total: ${data.total || 0} logs
                    ${data.pagination ? `| Showing ${data.data.length} of ${data.total}` : ''}
                </div>
            `;
        } catch (error) {
            return `<div class="error-box">Error loading audit logs: ${error.message}</div>`;
        }
    },

    // ============================================================
    // ===== ACTION HELPERS =====
    // ============================================================

    navigateTo(page) {
        this.loadPage(page);
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
    },

    // ----- VOTE HEAD ACTIONS -----
    showCreateVoteHead() {
        this.openModal('Create Vote Head', `
            <form onsubmit="return App.submitCreateVoteHead(event)">
                <div class="form-group">
                    <label>ID</label>
                    <input type="text" id="vh-id" placeholder="e.g., VH-TEST" required />
                </div>
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="vh-name" placeholder="e.g., Test Fee" required />
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" id="vh-desc" placeholder="Description (optional)" />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Priority Order</label>
                        <input type="number" id="vh-priority" placeholder="e.g., 99" required />
                    </div>
                    <div class="form-group">
                        <label>Type</label>
                        <select id="vh-type">
                            <option value="false">Recurring</option>
                            <option value="true">One-Time</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Refundable</label>
                        <select id="vh-refundable">
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Active</label>
                        <select id="vh-active">
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Create Vote Head</button>
            </form>
        `);
    },

    async submitCreateVoteHead(event) {
        event.preventDefault();
        const data = {
            id: document.getElementById('vh-id').value.trim(),
            name: document.getElementById('vh-name').value.trim(),
            description: document.getElementById('vh-desc').value.trim(),
            priority_order: parseInt(document.getElementById('vh-priority').value),
            is_one_time: document.getElementById('vh-type').value === 'true',
            is_refundable: document.getElementById('vh-refundable').value === 'true',
            is_active: document.getElementById('vh-active').value === 'true',
        };

        try {
            await api.createVoteHead(data);
            this.closeModal();
            await this.loadPage('vote-heads');
        } catch (error) {
            alert('Error: ' + error.message);
        }
        return false;
    },

    async toggleVoteHead(id) {
        if (!confirm('Toggle this vote head?')) return;
        try {
            await api.toggleVoteHead(id);
            await this.loadPage('vote-heads');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    },

    async deleteVoteHead(id) {
        if (!confirm('Delete this vote head? This will remove it permanently.')) return;
        try {
            await api.deleteVoteHead(id);
            await this.loadPage('vote-heads');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    },

    // ----- FEE STRUCTURE ACTIONS -----
    showCreateFeeStructure() {
        this.openModal('Create Fee Structure', `
            <form onsubmit="return App.submitCreateFeeStructure(event)">
                <div class="form-group">
                    <label>Version Label</label>
                    <input type="text" id="fs-version" placeholder="e.g., 2026 Gazette" required />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Term Number</label>
                        <select id="fs-term">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Scope Type</label>
                        <select id="fs-scope">
                            <option value="college">College</option>
                            <option value="department">Department</option>
                            <option value="programme">Programme</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Scope ID (leave blank for college)</label>
                    <input type="text" id="fs-scope-id" placeholder="e.g., DEPT-ICT or PROG-DICT" />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Valid From</label>
                        <input type="date" id="fs-valid-from" required />
                    </div>
                    <div class="form-group">
                        <label>Total Amount</label>
                        <input type="number" step="0.01" id="fs-total" placeholder="e.g., 22398.00" required />
                    </div>
                </div>
                <div class="form-group">
                    <label>Created By</label>
                    <input type="text" id="fs-created-by" placeholder="e.g., ADMIN-01" required />
                </div>
                <div class="form-group">
                    <label>Lines (vote_head_id:amount, one per line)</label>
                    <textarea id="fs-lines" rows="4" placeholder='e.g., VH-ACT:1600, VH-TUI:13240' required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Create Fee Structure</button>
            </form>
        `);
    },

    async submitCreateFeeStructure(event) {
        event.preventDefault();
        const linesText = document.getElementById('fs-lines').value.trim();
        const lines = linesText.split(',').map(line => {
            const [vote_head_id, amount] = line.trim().split(':');
            return { vote_head_id: vote_head_id.trim(), amount: parseFloat(amount), priority_order: 5 };
        });

        const data = {
            version_label: document.getElementById('fs-version').value.trim(),
            term_number: parseInt(document.getElementById('fs-term').value),
            scope_type: document.getElementById('fs-scope').value,
            scope_id: document.getElementById('fs-scope-id').value.trim() || null,
            valid_from: document.getElementById('fs-valid-from').value,
            valid_to: null,
            total_amount: parseFloat(document.getElementById('fs-total').value),
            created_by: document.getElementById('fs-created-by').value.trim(),
            lines: lines,
        };

        try {
            await api.createFeeStructure(data);
            this.closeModal();
            await this.loadPage('fee-structures');
        } catch (error) {
            alert('Error: ' + error.message);
        }
        return false;
    },

    async closeFeeStructure(id) {
        const validTo = prompt('Enter closure date (YYYY-MM-DD):');
        if (!validTo) return;
        if (!confirm('Close this fee structure?')) return;

        try {
            await api.closeFeeStructure(id, { valid_to: validTo, closedBy: 'ADMIN' });
            await this.loadPage('fee-structures');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    },

    // ----- ENROLLMENT ACTIONS (uses reg no only) -----
    showCreateEnrollment() {
        this.openModal('Create Enrollment', `
            <form onsubmit="return App.submitCreateEnrollment(event)">
                <div class="form-group">
                    <label>Registration Number</label>
                    <input type="text" id="en-reg-no" placeholder="e.g., 2026-ICT-001" required />
                </div>
                <div class="form-group">
                    <label>Student Name</label>
                    <input type="text" id="en-student-name" placeholder="e.g., John Mwangi" />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Programme Code</label>
                        <input type="text" id="en-programme" placeholder="e.g., DICT" required />
                    </div>
                    <div class="form-group">
                        <label>Student Year</label>
                        <input type="number" id="en-year" value="1" required />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Student Term</label>
                        <select id="en-term">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Enrollment Date</label>
                        <input type="date" id="en-date" required />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Category</label>
                        <select id="en-category">
                            <option value="regular">Regular</option>
                            <option value="kuccps">KUCCPS</option>
                            <option value="nita">NITA</option>
                            <option value="employer">Employer</option>
                            <option value="self_sponsored">Self Sponsored</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>New Student</label>
                        <select id="en-new">
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Enrolled By</label>
                    <input type="text" id="en-enrolled-by" placeholder="e.g., HOD-001" required />
                </div>
                <button type="submit" class="btn btn-primary">Process Enrollment</button>
            </form>
        `);
    },

    async submitCreateEnrollment(event) {
        event.preventDefault();
        const data = {
            event: 'TERM_ADVANCED',
            eventId: document.getElementById('en-event-id')?.value.trim() || undefined,
            studentRegNo: document.getElementById('en-reg-no').value.trim(),
            studentName: document.getElementById('en-student-name').value.trim() || undefined,
            programmeCode: document.getElementById('en-programme').value.trim(),
            studentYear: parseInt(document.getElementById('en-year').value),
            studentTerm: parseInt(document.getElementById('en-term').value),
            enrollmentDate: document.getElementById('en-date').value,
            studentCategory: document.getElementById('en-category').value,
            isNewStudent: document.getElementById('en-new').value === 'true',
            enrolledBy: document.getElementById('en-enrolled-by').value.trim(),
        };

        try {
            await api.processEnrollment(data);
            this.closeModal();
            alert('Enrollment processed successfully!');
            await this.loadPage('enrollments');
            document.getElementById('enrollment-search').value = data.studentRegNo;
            this.searchEnrollments();
        } catch (error) {
            alert('Error: ' + error.message);
        }
        return false;
    },

    // ----- PAYMENT ACTIONS (modal — uses "pm-" prefixed ids so they never
    //       collide with the inline search-result form on the Payments page) -----
    showPostPayment() {
        this.openModal('Post Payment', `
            <div style="margin-bottom:16px;padding:12px;background:#e8f4fd;border-radius:6px;border-left:4px solid #1a5276;">
                <strong>💡 Tip:</strong> Search for a student first, then click an obligation to auto-fill.
            </div>

            <!-- Student Search -->
            <div class="form-group">
                <label>Registration Number <span style="color:#e74c3c;">*</span></label>
                <div style="display:flex;gap:8px;">
                    <input type="text" id="pm-reg-no" placeholder="e.g., 2026-ICT-001" style="flex:1;" />
                    <button class="btn btn-sm btn-primary" onclick="App.fetchObligationsForPayment()">Fetch</button>
                </div>
            </div>

            <!-- Obligations List -->
            <div id="pm-obligations-list" style="margin:12px 0;max-height:200px;overflow-y:auto;display:none;border:1px solid #ddd;border-radius:6px;">
                <div style="background:#f8f9fa;padding:8px 12px;font-weight:600;font-size:13px;border-bottom:1px solid #ddd;">
                    Select an obligation:
                </div>
                <div id="pm-obligations-options"></div>
            </div>

            <!-- Obligation ID -->
            <div class="form-group">
                <label>Obligation ID <span style="color:#e74c3c;">*</span></label>
                <input type="text" id="pm-obligation-id" placeholder="e.g., OBL-xxx" />
            </div>

            <!-- Amount -->
            <div class="form-group">
                <label>Amount (KES) <span style="color:#e74c3c;">*</span></label>
                <input type="number" step="0.01" id="pm-amount" placeholder="e.g., 20000.00" />
            </div>

            <!-- Payment Mode -->
            <div class="form-group">
                <label>Payment Mode <span style="color:#e74c3c;">*</span></label>
                <select id="pm-mode" onchange="App.toggleBankField()">
                    <option value="cash">Cash</option>
                    <option value="mpesa" selected>M-Pesa</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                </select>
            </div>

            <!-- Bank Name (shown only for bank_transfer) -->
            <div id="pm-bank-field" style="display:none;">
                <div class="form-group">
                    <label>Bank Name <span style="color:#e74c3c;">*</span></label>
                    <select id="pm-bank-name">
                        <option value="">-- Select Bank --</option>
                        <option value="KCB">KCB</option>
                        <option value="Equity">Equity</option>
                        <option value="Cooperative">Cooperative</option>
                        <option value="Stanbic">Stanbic</option>
                        <option value="NCBA">NCBA</option>
                        <option value="Absa">Absa</option>
                        <option value="Standard Chartered">Standard Chartered</option>
                        <option value="Diamond Trust Bank">Diamond Trust Bank</option>
                        <option value="Family Bank">Family Bank</option>
                        <option value="I&M Bank">I&M Bank</option>
                        <option value="Prime Bank">Prime Bank</option>
                        <option value="National Bank">National Bank</option>
                        <option value="NIC Bank">NIC Bank</option>
                        <option value="Ecobank">Ecobank</option>
                        <option value="Citi Bank">Citi Bank</option>
                        <option value="Bank of Africa">Bank of Africa</option>
                        <option value="K-Rep Bank">K-Rep Bank</option>
                        <option value="Consolidated Bank">Consolidated Bank</option>
                        <option value="Development Bank">Development Bank</option>
                        <option value="Kenya Post Office Savings Bank">Kenya Post Office Savings Bank</option>
                        <option value="Gulf African Bank">Gulf African Bank</option>
                        <option value="First Community Bank">First Community Bank</option>
                        <option value="Sidian Bank">Sidian Bank</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            <!-- Funding Source -->
            <div class="form-group">
                <label>Funding Source <span style="color:#e74c3c;">*</span></label>
                <select id="pm-source">
                    <option value="self" selected>Self</option>
                    <option value="kuccps">KUCCPS</option>
                    <option value="nita">NITA</option>
                    <option value="helb">HELB</option>
                    <option value="employer">Employer</option>
                    <option value="cdf_bursary">CDF Bursary</option>
                    <option value="county_bursary">County Bursary</option>
                </select>
            </div>

            <!-- Transaction Ref & Payment Date -->
            <div class="form-row">
                <div class="form-group">
                    <label>Transaction Reference</label>
                    <input type="text" id="pm-txn-ref" placeholder="e.g., PAY-001" />
                </div>
                <div class="form-group">
                    <label>Payment Date <span style="color:#e74c3c;">*</span></label>
                    <input type="date" id="pm-date" value="${new Date().toISOString().split('T')[0]}" />
                </div>
            </div>

            <!-- Received By -->
            <div class="form-group">
                <label>Received By <span style="color:#e74c3c;">*</span></label>
                <input type="text" id="pm-received-by" placeholder="e.g., CASHIER-01" value="CASHIER-01" />
            </div>

            <button class="btn btn-primary" onclick="App.submitPostPaymentFromModal()" style="width:100%;padding:10px;margin-top:8px;">Post Payment</button>
            <div id="pm-modal-result" style="margin-top:12px;"></div>
        `);
    },

    toggleBankField() {
        const mode = document.getElementById('pm-mode').value;
        const bankField = document.getElementById('pm-bank-field');
        bankField.style.display = mode === 'bank_transfer' ? 'block' : 'none';
    },

    async fetchObligationsForPayment() {
        const regNo = document.getElementById('pm-reg-no').value.trim();
        const listContainer = document.getElementById('pm-obligations-list');
        const optionsContainer = document.getElementById('pm-obligations-options');

        if (!regNo) {
            optionsContainer.innerHTML = `<div style="color:#721c24;padding:8px;background:#f8d7da;border-radius:4px;">Please enter a registration number</div>`;
            listContainer.style.display = 'block';
            return;
        }

        try {
            const data = await api.getStudentFeePosition(regNo);
            const position = data.data;

            if (!position || !position.found) {
                optionsContainer.innerHTML = `<div style="color:#721c24;padding:8px;background:#f8d7da;border-radius:4px;">Student "${regNo}" not found</div>`;
                listContainer.style.display = 'block';
                return;
            }

            const obligations = position.obligations || [];

            if (obligations.length === 0) {
                optionsContainer.innerHTML = `<div style="color:#856404;padding:8px;background:#fff3cd;border-radius:4px;">No obligations found for this student</div>`;
                listContainer.style.display = 'block';
                return;
            }

            let html = '';
            obligations.forEach(ob => {
                const balance = ob.totalBalance || 0;
                const statusColor = ob.status === 'cleared' ? 'badge-success' : ob.status === 'partial' ? 'badge-warning' : 'badge-danger';
                html += `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid #eee;cursor:pointer;transition:background 0.2s;"
                         onmouseover="this.style.background='#f0f4f8'"
                         onmouseout="this.style.background='transparent'"
                         onclick="App.selectPaymentObligation('${ob.obligationId}', ${balance})">
                        <div>
                            <strong>${ob.type}</strong> - Term ${ob.studentTerm}
                            <span class="badge ${statusColor}" style="margin-left:8px;">${ob.status}</span>
                        </div>
                        <div>
                            Balance: <strong>KES ${balance.toFixed(2)}</strong>
                            <span style="margin-left:10px;color:#1a5276;font-size:12px;">→ Select</span>
                        </div>
                    </div>
                `;
            });

            optionsContainer.innerHTML = html;
            listContainer.style.display = 'block';

        } catch (error) {
            optionsContainer.innerHTML = `<div style="color:#721c24;padding:8px;background:#f8d7da;border-radius:4px;">Error: ${error.message}</div>`;
            listContainer.style.display = 'block';
        }
    },

    selectPaymentObligation(obligationId, balance) {
        document.getElementById('pm-obligation-id').value = obligationId;
        document.getElementById('pm-amount').value = balance;
        document.getElementById('pm-obligations-list').style.display = 'none';
    },

    async submitPostPaymentFromModal() {
        const regNo = document.getElementById('pm-reg-no').value.trim();
        const obligationId = document.getElementById('pm-obligation-id').value.trim();
        const amount = parseFloat(document.getElementById('pm-amount').value);
        const paymentMode = document.getElementById('pm-mode').value;
        const bankName = document.getElementById('pm-bank-name')?.value || null;
        const fundingSource = document.getElementById('pm-source').value;
        const transactionRef = document.getElementById('pm-txn-ref').value.trim() || undefined;
        const receivedBy = document.getElementById('pm-received-by').value.trim();
        const paymentDate = document.getElementById('pm-date').value;
        const resultContainer = document.getElementById('pm-modal-result');

        resultContainer.innerHTML = '';

        if (!regNo) {
            resultContainer.innerHTML = '<div class="error-box">Please enter a registration number</div>';
            return;
        }

        if (!obligationId) {
            resultContainer.innerHTML = '<div class="error-box">Please enter or select an obligation ID</div>';
            return;
        }

        if (!amount || isNaN(amount) || amount <= 0) {
            resultContainer.innerHTML = '<div class="error-box">Please enter a valid amount (must be greater than 0)</div>';
            return;
        }

        if (!receivedBy) {
            resultContainer.innerHTML = '<div class="error-box">Please enter who received the payment (e.g., CASHIER-01)</div>';
            return;
        }

        if (!paymentDate) {
            resultContainer.innerHTML = '<div class="error-box">Please select a payment date</div>';
            return;
        }

        if (paymentMode === 'bank_transfer' && !bankName) {
            resultContainer.innerHTML = '<div class="error-box">Please select a bank name for bank transfer</div>';
            return;
        }

        resultContainer.innerHTML = '<div class="loading">Posting payment...</div>';

        try {
            const data = {
                regNo: regNo,
                obligations: [
                    {
                        obligationId: obligationId,
                        amount: amount
                    }
                ],
                totalAmount: amount,
                paymentMode: paymentMode,
                bankName: bankName,
                transactionRef: transactionRef,
                fundingSource: fundingSource,
                receivedBy: receivedBy,
                paymentDate: paymentDate,
            };

            const response = await api.postPayment(data);

            resultContainer.innerHTML = `
                <div style="background:#d4edda;padding:15px;border-radius:6px;border:1px solid #c3e6cb;color:#155724;">
                    <strong>✅ Payment posted successfully!</strong><br>
                    Receipt Number: <strong>${response.data.payment.receipt_number}</strong><br>
                    Amount: KES ${parseFloat(response.data.payment.total_amount).toFixed(2)}<br>
                    ${response.data.obligationResults && response.data.obligationResults[0] ? `New Balance: KES ${response.data.obligationResults[0].newBalance.toFixed(2)}` : ''}
                </div>
            `;

            setTimeout(() => {
                App.closeModal();
                App.loadPage('payments');
            }, 3000);

        } catch (error) {
            resultContainer.innerHTML = `<div class="error-box">Error: ${error.message}</div>`;
        }
    },

    async reversePayment(id) {
        if (!confirm('Reverse this payment? This action cannot be undone.')) return;
        const notes = prompt('Reason for reversal:');
        if (notes === null) return;

        try {
            await api.reversePayment(id, { reversedBy: 'ADMIN', notes });
            alert('Payment reversed successfully');
            await this.loadPage('payments');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    },

    // ===== RENDER HELPERS =====
    renderTable(data, columns, actions) {
        if (!data || data.length === 0) {
            return '<p class="text-center" style="color:#999;">No data found</p>';
        }

        let html = '<div class="table-container"><table><thead><tr>';
        columns.forEach(col => {
            html += `<th>${col.label}</th>`;
        });
        if (actions) html += '<th>Actions</th>';
        html += '</tr></thead><tbody>';

        data.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                html += `<td>${col.render(row)}</td>`;
            });
            if (actions) {
                html += `<td>${actions(row)}</td>`;
            }
            html += '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    },
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

window.App = App;

