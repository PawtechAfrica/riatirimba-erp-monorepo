/**
 * API Client for Riatirimba Finance Service
 * Uses registration number as the primary identifier
 */
const API_BASE = window.location.origin + '/api';

class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(method, endpoint, data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'API request failed');
            }

            return result;
        } catch (error) {
            console.error(`[API Error] ${method} ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Encode registration number for URL (replace / with %2F)
     */
    encodeRegNo(regNo) {
        if (!regNo) return regNo;
        return encodeURIComponent(regNo);
    }

    /**
     * Normalize registration number for API (replace - with /)
     */
    normalizeRegNo(regNo) {
        if (!regNo) return regNo;
        return regNo.includes('/') ? regNo : regNo.replace(/-/g, '/');
    }

    // ===== VOTE HEADS =====
    async getVoteHeads() {
        return this.request('GET', '/vote-heads');
    }

    async createVoteHead(data) {
        return this.request('POST', '/vote-heads', data);
    }

    async updateVoteHead(id, data) {
        return this.request('PUT', `/vote-heads/${id}`, data);
    }

    async deleteVoteHead(id) {
        return this.request('DELETE', `/vote-heads/${id}`);
    }

    async toggleVoteHead(id) {
        return this.request('PATCH', `/vote-heads/${id}/toggle`);
    }

    // ===== FEE STRUCTURES =====
    async getFeeStructures(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request('GET', `/fee-structures?${params}`);
    }

    async createFeeStructure(data) {
        return this.request('POST', '/fee-structures', data);
    }

    async updateFeeStructure(id, data) {
        return this.request('PUT', `/fee-structures/${id}`, data);
    }

    async deleteFeeStructure(id) {
        return this.request('DELETE', `/fee-structures/${id}`);
    }

    async closeFeeStructure(id, data) {
        return this.request('PATCH', `/fee-structures/${id}/close`, data);
    }

    async copyFeeStructure(id, data) {
        return this.request('POST', `/fee-structures/${id}/copy`, data);
    }

    async resolveFeeStructure(data) {
        return this.request('POST', '/fee-structures/resolve', data);
    }

    async getFeeStructureVersions() {
        return this.request('GET', '/fee-structures/versions');
    }

    // ===== ENROLLMENTS =====
    async processEnrollment(data) {
        return this.request('POST', '/enrollment-events', data);
    }

    async getEnrollmentsByRegNo(regNo) {
        const encoded = this.encodeRegNo(regNo);
        return this.request('GET', `/enrollments?regNo=${encoded}`);
    }

    async updateEnrollmentStatus(id, data) {
        return this.request('PATCH', `/enrollments/${id}/status`, data);
    }

    // ===== PAYMENTS =====
    async postPayment(data) {
        return this.request('POST', '/payments', data);
    }

    async getPaymentsByRegNo(regNo) {
        const encoded = this.encodeRegNo(regNo);
        return this.request('GET', `/payments?regNo=${encoded}`);
    }

    async reversePayment(id, data) {
        return this.request('POST', `/payments/${id}/reverse`, data);
    }

    // ===== RECEIPTS =====
    async generateReceipt(obligationId, type = 'student') {
        const url = `/receipts/${obligationId}/pdf?type=${type}`;
        window.open(`${this.baseUrl}${url}`, '_blank');
    }

    async getReceiptJson(obligationId) {
        return this.request('GET', `/receipts/${obligationId}/json`);
    }

    // ===== STUDENTS =====
    async getStudentFeePosition(regNo, year = null) {
        const encoded = this.encodeRegNo(regNo);
        const params = year ? `&studentYear=${year}` : '';
        return this.request('GET', `/students/fee-position?regNo=${encoded}${params}`);
    }

    async getStudentSummary(regNo) {
        const encoded = this.encodeRegNo(regNo);
        return this.request('GET', `/students/summary?regNo=${encoded}`);
    }

    // ===== REPORTS =====
    async getDailyCollection(date) {
        const params = date ? `?date=${date}` : '';
        return this.request('GET', `/reports/daily-collection${params}`);
    }

    async getWeeklySummary(weekStart) {
        const params = weekStart ? `?weekStart=${weekStart}` : '';
        return this.request('GET', `/reports/weekly-summary${params}`);
    }

    async getMonthlySummary(year, month) {
        const params = new URLSearchParams({ year, month }).toString();
        return this.request('GET', `/reports/monthly-summary?${params}`);
    }

    async getProgrammeCollection(startDate, endDate) {
        const params = new URLSearchParams({ startDate, endDate }).toString();
        return this.request('GET', `/reports/programme-collection?${params}`);
    }

    async getAgingReport() {
        return this.request('GET', '/reports/aging');
    }

    async getCollectionSummary(startDate, endDate) {
        const params = new URLSearchParams({ startDate, endDate }).toString();
        return this.request('GET', `/reports/collection-summary?${params}`);
    }

    // ===== AUDIT LOGS =====
    async getAuditLogs(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request('GET', `/audit-logs?${params}`);
    }

    async getAuditLogStats() {
        return this.request('GET', '/audit-logs/stats');
    }

    async getAuditLogsByUser(userId) {
        return this.request('GET', `/audit-logs/user/${userId}`);
    }

    async getAuditLogsByEntity(entityType, entityId) {
        return this.request('GET', `/audit-logs/entity/${entityType}/${entityId}`);
    }

    // ===== OUTSTANDING =====
    async getOutstanding() {
        return this.request('GET', '/reports/outstanding');
    }
}

// Create global instance
const api = new ApiClient(API_BASE);