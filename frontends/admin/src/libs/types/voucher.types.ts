export type VoucherPaymentMethod = 'CASH' | 'ONLINE' | 'KCB_OPERATIONS' | 'KCB_DEVELOPMENT' | 'EQUITY_BANK'

export interface VoucherLineItem {
    date?: string;                // Row date (free text or ISO) [cite: 12]
    particulars: string;          // Required: Description of expense [cite: 12]
    kshs?: number;                // Amount in KES (integer) [cite: 12]
    cts?: number;                 // Cent portion (0-99) [cite: 12]
}

export interface VoucherVoteHeadItem {
    date?: string;                // Row date (free text or ISO) [cite: 14]
    expenditureVoteHead: string;  // Required: VoteHead name/code [cite: 14]
    kshs?: number;                // Amount in KES [cite: 14]
    cts?: number;                 // Cent portion (0-99) [cite: 14]
}

export interface VoucherObj {
    id: number;                   // Auto-increment primary key [cite: 9]
    voucherNo: string;            // Server-assigned serial number [cite: 9]
    date: string;                 // ISO 8601 format: YYYY-MM-DD [cite: 9]
    payeeName: string;            // Full name of payee [cite: 9]
    payeeAddress: string;         // Physical or postal address [cite: 9]
    accountName?: string;         // Bank/account name [cite: 9]
    lineItems: VoucherLineItem[];        // Array of particulars [cite: 9]
    amountInWords: string;        // Auto-computed by server [cite: 9]
    chequeNo: string;             // Cheque number [cite: 9]
    voteheadItems: VoucherVoteHeadItem[];      // Array of expenditure rows [cite: 9]
    paymentMethod: VoucherPaymentMethod | null;
    paymentDetails: string | number;

    preparedBy?: string;          // Staff who prepared [cite: 9]
    preparedDate?: string;        // ISO date prepared [cite: 9]
    approvedBy?: string;          // Finance Officer name [cite: 9]
    approvedDate?: string | null;        // ISO date approved [cite: 9]

    receivedSum?: string | null;         // Text description of sum [cite: 9, 57]
    receivedCashOrCheque?: string | null;// "Cash" or "Cheque" [cite: 9, 58]
    receiverSignature?: string | null;   // Receiver signature reference [cite: 9, 59]
    receiverIdNo?: string | null;        // National ID of receiver [cite: 9, 60]
    receivedDate?: string | null;        // ISO date received [cite: 9, 61]

    authorizedByPrincipal?: string | null; // Principal name [cite: 9, 62]
    authorizedDate?: string | null;        // ISO date authorized [cite: 9, 63]

    pdfGenerated: boolean;        // True once PDF is streamed [cite: 9]
    createdAt: string;            // ISO timestamp [cite: 10]
    updatedAt: string;            // ISO timestamp [cite: 10]

    votehead: string | null;
    budget: number | null;
    amountSpent: number | null;
}

// Subset returned by GET /api/vouchers
export type VoucherSummary = Pick<
    VoucherObj,
    | 'id'
    | 'voucherNo'
    | 'date'
    | 'payeeName'
    | 'payeeAddress'
    | 'amountInWords'
    | 'chequeNo'
>;

export type ClientWritableVoucherFields = Omit<
    VoucherObj,
    'id' | 'voucherNo' | 'amountInWords' | 'pdfGenerated' | 'createdAt' | 'updatedAt'
>;

// POST /api/vouchers [cite: 70, 71, 72]
export type CreateVoucherRequest = ClientWritableVoucherFields;

// PUT /api/vouchers/:id [cite: 136, 137, 138]
// All fields are optional for partial updates.
// Note: amountInWords is automatically recomputed if lineItems change [cite: 139]
export type UpdateVoucherRequest = Partial<ClientWritableVoucherFields>;

// POST /api/vouchers/batch [cite: 108, 109, 114, 115]
export interface BatchCreateVouchersRequest {
    count: number;                                // Required: Max 200 [cite: 111, 114]
    template?: Partial<CreateVoucherRequest>;     // Optional template fields [cite: 115, 120]
}

// Response from POST /api/vouchers/batch [cite: 121, 122, 123]
export interface BatchCreateVouchersResponse {
    created: number;                              // Number of records created [cite: 122]
    vouchers: Array<Partial<VoucherObj>>
    // vouchers: Array<{                             // Brief summary of created items [cite: 124, 126]
    //     id: number;
    //     voucherNo: string;
    // }>;
}

// POST /api/vouchers/batch-pdf [cite: 179, 180, 184, 186]
export interface BatchPdfRequest {
    ids?: number[];                               // Array of primary keys [cite: 182, 185]
    all?: boolean;                                // Set to true to print all [cite: 182, 187]
}
