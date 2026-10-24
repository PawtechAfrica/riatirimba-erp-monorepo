export interface VoteHeadObj {
    id: string;
    name: string;
    description?: string;
    priority_order: number;
    is_one_time: boolean;
    is_refundable: boolean;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateVoteHeadDto {
    id: string;
    name: string;
    description?: string;
    priority_order: number;
    is_one_time: boolean;
    is_refundable: boolean;
    is_active: boolean;
}

export interface UpdateVoteHeadDto {
    name?: string;
    description?: string;
    priority_order?: number;
    is_one_time?: boolean;
    is_refundable?: boolean;
    is_active?: boolean;
}

export interface FeeStructureLine {
    id?: string;
    fee_structure_id?: string;
    vote_head_id: string;
    amount: number;
    priority_order: number;
    vote_head_name?: string;
}

export interface FeeStructureObj {
    id: string;
    version_label: string;
    term_number: number;
    scope_type: 'college' | 'department' | 'programme' | string;
    scope_id?: string | null;
    valid_from: string;
    valid_to?: string | null;
    total_amount: number;
    is_active: boolean;
    created_by: string;
    created_at?: string;
    lines?: FeeStructureLine[];
}

export interface CreateFeeStructureDto {
    version_label: string;
    term_number: number;
    scope_type: string;
    scope_id?: string | null;
    valid_from: string;
    valid_to?: string | null;
    total_amount: number;
    created_by: string;
    lines: FeeStructureLine[];
}

export interface CloseFeeStructureDto {
    valid_to: string;
    closedBy?: string;
}

export interface CopyFeeStructureDto {
    newVersionLabel: string;
    validFrom: string;
    copiedBy?: string;
}

export interface EnrollmentObligation {
    id: string;
    obligationId: string;
    type: string;
    studentTerm: number;
    totalAmount: number;
    totalPaid: number;
    totalBalance: number;
    status: 'pending' | 'partial' | 'cleared' | string;
}

export interface EnrollmentObj {
    id: string;
    eventId?: string;
    studentId: string;
    studentName?: string;
    studentRegNo?: string;
    programmeCode: string;
    studentYear: number;
    studentTerm: number;
    status: 'active' | 'completed' | 'withdrawn' | string;
    enrollmentDate?: string;
    studentCategory?: string;
    isNewStudent?: boolean;
    enrolledBy?: string;
    obligations?: EnrollmentObligation[];
}

export interface ProcessEnrollmentDto {
    event: 'TERM_ADVANCED';
    eventId: string;
    studentId: string;
    studentName?: string;
    studentRegNo?: string;
    programmeCode: string;
    studentYear: number;
    studentTerm: number;
    enrollmentDate: string;
    studentCategory: string;
    isNewStudent: boolean;
    enrolledBy: string;
}

export interface PaymentObligationInput {
    obligationId: string;
    amount: number;
}

export interface PaymentObj {
    id: string;
    receipt_number: string;
    student_id: string;
    total_amount: number;
    payment_mode: string;
    transaction_ref?: string;
    funding_source: string;
    received_by?: string;
    payment_date: string;
    status?: string;
    created_at?: string;
}

export interface PostPaymentDto {
    regNo: string;
    bankName: string;
    obligations: PaymentObligationInput[];
    totalAmount: number;
    paymentMode: string;
    transactionRef?: string;
    fundingSource: string;
    receivedBy: string;
    paymentDate: string;
}

export interface ReversePaymentDto {
    reversedBy: string;
    notes?: string;
}

export interface StudentFeePositionSummary {
    totalBalance: number;
    totalPaid: number;
    grandTotal: number;
    creditOnAccount: number;
}

export interface StudentFeePositionObj {
    found: boolean;
    studentId: string;
    studentName?: string;
    studentRegNo?: string;
    programmeCode?: string;
    summary: StudentFeePositionSummary;
    obligations: EnrollmentObligation[];
    obligationCount: number;
    enrollmentCount: number;
}

export interface ReceiptJsonObj {
    receiptNumber: string;
    generatedDate: string;
    studentId: string;
    studentName?: string;
    studentRegNo?: string;
    programmeCode?: string;
    obligationId: string;
    obligationType: string;
    studentTerm?: number;
    totalAmount: number;
    totalPaid: number;
    totalBalance: number;
    status: string;
    payments?: PaymentObj[];
    lines?: FeeStructureLine[];
}

export interface DailyCollectionReport {
    date: string;
    summary: {
        totalCollected: number;
        totalTransactions: number;
        averageTransaction: number;
    };
    byPaymentMode?: Record<string, { count: number; total: number }>;
}

export interface MonthlySummaryReport {
    month: string;
    summary: {
        totalCollected: number;
        totalTransactions: number;
    };
    weeklyBreakdown?: Record<string, { count: number; total: number }>;
}

export interface AgingBucketData {
    count: number;
    total: number;
    students?: string[];
}

export interface AgingReport {
    totalOutstanding: number;
    totalStudents: number;
    agingBuckets: Record<string, AgingBucketData>;
}

export interface ProgrammeCollectionItem {
    programmeCode: string;
    studentCount: number;
    transactionCount: number;
    totalPaid: number;
}

export interface ProgrammeCollectionReport {
    summary: {
        totalCollected: number;
        totalProgrammes: number;
    };
    programmes: ProgrammeCollectionItem[];
}

export interface AuditLogObj {
    id: string;
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    payload?: Record<string, any>;
    created_at: string;
}

export interface AuditLogStats {
    total: number;
    today: number;
    recent?: AuditLogObj[];
}
