import apis from "@/libs/api.ts";
import * as f from "@/libs/types/fees.types.ts";

export class FeesService {
    // ===== VOTE HEADS =====
    async getVoteHeads(): Promise<f.VoteHeadObj[]> {
        const res = await apis.fees.get<{ data: f.VoteHeadObj[] }>("/vote-heads");
        return res.data.data || [];
    }

    async createVoteHead(data: f.CreateVoteHeadDto): Promise<f.VoteHeadObj> {
        const res = await apis.fees.post<{ data: f.VoteHeadObj }>("/vote-heads", data);
        return res.data.data;
    }

    async updateVoteHead(id: string, data: f.UpdateVoteHeadDto): Promise<f.VoteHeadObj> {
        const res = await apis.fees.put<{ data: f.VoteHeadObj }>(`/vote-heads/${id}`, data);
        return res.data.data;
    }

    async deleteVoteHead(id: string): Promise<void> {
        await apis.fees.delete(`/vote-heads/${id}`);
    }

    async toggleVoteHead(id: string): Promise<f.VoteHeadObj> {
        const res = await apis.fees.patch<{ data: f.VoteHeadObj }>(`/vote-heads/${id}/toggle`);
        return res.data.data;
    }

    // ===== FEE STRUCTURES =====
    async getFeeStructures(filters: Record<string, any> = {}): Promise<f.FeeStructureObj[]> {
        const params = new URLSearchParams(filters).toString();
        const res = await apis.fees.get<{ data: f.FeeStructureObj[] }>(`/fee-structures?${params}`);
        return res.data.data || [];
    }

    async createFeeStructure(data: f.CreateFeeStructureDto): Promise<f.FeeStructureObj> {
        const res = await apis.fees.post<{ data: f.FeeStructureObj }>("/fee-structures", data);
        return res.data.data;
    }

    async updateFeeStructure(id: string, data: Partial<f.CreateFeeStructureDto>): Promise<f.FeeStructureObj> {
        const res = await apis.fees.put<{ data: f.FeeStructureObj }>(`/fee-structures/${id}`, data);
        return res.data.data;
    }

    async deleteFeeStructure(id: string): Promise<void> {
        await apis.fees.delete(`/fee-structures/${id}`);
    }

    async closeFeeStructure(id: string, data: f.CloseFeeStructureDto): Promise<f.FeeStructureObj> {
        const res = await apis.fees.patch<{ data: f.FeeStructureObj }>(`/fee-structures/${id}/close`, data);
        return res.data.data;
    }

    async copyFeeStructure(id: string, data: f.CopyFeeStructureDto): Promise<f.FeeStructureObj> {
        const res = await apis.fees.post<{ data: f.FeeStructureObj }>(`/fee-structures/${id}/copy`, data);
        return res.data.data;
    }

    // ===== ENROLLMENTS =====
    async processEnrollment(data: f.ProcessEnrollmentDto): Promise<any> {
        const res = await apis.fees.post("/enrollment-events", data);
        return res.data;
    }

    async getEnrollmentsByStudent(studentId: string): Promise<f.EnrollmentObj[]> {
        const res = await apis.fees.get<{ data: f.EnrollmentObj[] }>(`/enrollments`, {
            params: {regNo: studentId},
        });
        return res.data.data || [];
    }

    async updateEnrollmentStatus(id: string, data: { status: string }): Promise<f.EnrollmentObj> {
        const res = await apis.fees.patch<{ data: f.EnrollmentObj }>(`/enrollments/${id}/status`, data);
        return res.data.data;
    }

    // ===== PAYMENTS =====
    async postPayment(data: f.PostPaymentDto): Promise<any> {
        const res = await apis.fees.post("/payments", data);
        return res.data;
    }

    async getPaymentsByStudent(admissionNumber: string): Promise<f.PaymentObj[]> {
        const res = await apis.fees.get<{ data: f.PaymentObj[] }>(`/payments/`, {
            params: {
                regNo: admissionNumber
            }
        });
        return res.data.data || [];
    }

    async reversePayment(id: string, data: f.ReversePaymentDto): Promise<any> {
        const res = await apis.fees.post(`/payments/${id}/reverse`, data);
        return res.data;
    }

    // ===== RECEIPTS =====
    async getReceiptJson(obligationId: string): Promise<f.ReceiptJsonObj> {
        const res = await apis.fees.get<{ data: f.ReceiptJsonObj }>(`/receipts/${obligationId}/json`);
        return res.data.data;
    }

    getReceiptPdfUrl(obligationId: string, type: 'student' | 'sponsor' = 'student'): string {
        const baseURL = apis.fees.defaults.baseURL || '';
        return `${baseURL}/receipts/${obligationId}/pdf?type=${type}`;
    }

    // ===== STUDENTS =====
    async getStudentFeePosition(admissionNumber: string, studentYear?: number): Promise<f.StudentFeePositionObj> {
        const res = await apis.fees.get<{ data: f.StudentFeePositionObj }>(`/students/fee-position`, {
            params: {
                regNo: admissionNumber,
                ...(studentYear ? {studentYear} : {})
            }
        });
        return res.data.data;
    }

    async getOutstanding(): Promise<any[]> {
        const res = await apis.fees.get<{ data: any[] }>("/reports/outstanding");
        return res.data.data || [];
    }

    // ===== REPORTS =====
    async getDailyCollection(date?: string): Promise<f.DailyCollectionReport> {
        const params = date ? `?date=${date}` : '';
        const res = await apis.fees.get<{ data: f.DailyCollectionReport }>(`/reports/daily-collection${params}`);
        return res.data.data;
    }

    async getWeeklySummary(weekStart?: string): Promise<any> {
        const params = weekStart ? `?weekStart=${weekStart}` : '';
        const res = await apis.fees.get(`/reports/weekly-summary${params}`);
        return res.data.data;
    }

    async getMonthlySummary(year: number, month: number): Promise<f.MonthlySummaryReport> {
        const params = new URLSearchParams({year: year.toString(), month: month.toString()}).toString();
        const res = await apis.fees.get<{ data: f.MonthlySummaryReport }>(`/reports/monthly-summary?${params}`);
        return res.data.data;
    }

    async getProgrammeCollection(startDate: string, endDate: string): Promise<f.ProgrammeCollectionReport> {
        const params = new URLSearchParams({startDate, endDate}).toString();
        const res = await apis.fees.get<{
            data: f.ProgrammeCollectionReport
        }>(`/reports/programme-collection?${params}`);
        return res.data.data;
    }

    async getAgingReport(): Promise<f.AgingReport> {
        const res = await apis.fees.get<{ data: f.AgingReport }>("/reports/aging");
        return res.data.data;
    }

    // ===== AUDIT LOGS =====
    async getAuditLogs(filters: Record<string, any> = {}): Promise<{ data: f.AuditLogObj[]; total: number }> {
        const params = new URLSearchParams(filters).toString();
        const res = await apis.fees.get<{ data: f.AuditLogObj[]; total: number }>(`/audit-logs?${params}`);
        return {data: res.data.data || [], total: res.data.total || 0};
    }

    async getAuditLogStats(): Promise<f.AuditLogStats> {
        const res = await apis.fees.get<{ data: f.AuditLogStats }>("/audit-logs/stats");
        return res.data.data;
    }
}

const feesService = new FeesService();
export default feesService;
