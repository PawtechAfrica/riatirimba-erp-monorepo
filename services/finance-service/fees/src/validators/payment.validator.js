// const { z } = require('zod');

// const paymentSchema = z.object({
//   studentId: z.string().max(20).optional(),
//   obligations: z.array(
//     z.object({
//       obligationId: z.string().max(20),
//       amount: z.number().positive(),
//     })
//   ).min(1, 'At least one obligation is required'),
//   totalAmount: z.number().positive(),
//   paymentMode: z.enum(['cash', 'mpesa', 'bank_transfer', 'cheque', 'credit_transfer']),
//   transactionRef: z.string().max(100).optional(),
//   fundingSource: z.enum(['self', 'kuccps', 'nita', 'helb', 'employer', 'cdf_bursary', 'county_bursary', 'carry_forward']),
//   helbBand: z.string().max(10).optional(),
//   sponsorName: z.string().max(100).optional(),
//   receivedBy: z.string().max(20),
//   paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
//   notes: z.string().optional(),
// });

// const reversePaymentSchema = z.object({
//   reversedBy: z.string().max(20),
//   notes: z.string().optional(),
// });

// module.exports = {
//   paymentSchema,
//   reversePaymentSchema,
// };






const { z } = require('zod');

const paymentSchema = z.object({
  regNo: z.string().min(1).max(50),
  obligations: z.array(
    z.object({
      obligationId: z.string().max(20),
      amount: z.number().positive(),
    })
  ).min(1, 'At least one obligation is required'),
  totalAmount: z.number().positive(),
  paymentMode: z.enum(['cash', 'mpesa', 'bank_transfer', 'cheque', 'credit_transfer']),
  bankName: z.string().max(50).optional().nullable(),
  transactionRef: z.string().max(100).optional(),
  fundingSource: z.enum(['self', 'kuccps', 'nita', 'helb', 'employer', 'cdf_bursary', 'county_bursary', 'carry_forward']),
  helbBand: z.string().max(10).optional(),
  sponsorName: z.string().max(100).optional(),
  receivedBy: z.string().max(50),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  notes: z.string().optional(),
});

const reversePaymentSchema = z.object({
  reversedBy: z.string().max(50),
  notes: z.string().optional(),
});

module.exports = {
  paymentSchema,
  reversePaymentSchema,
};