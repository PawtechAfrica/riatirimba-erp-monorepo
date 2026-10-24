const paymentService = require('../services/payment.service');
const { logger } = require('../utils/logger');
const { ApiError } = require('../middlewares/errorHandler');

/**
 * Normalize registration number (handle both / and - formats)
 */
const normalizeRegNo = (regNo) => {
  if (!regNo) return regNo;
  return regNo.includes('/') ? regNo : regNo.replace(/-/g, '/');
};

/**
 * Post a payment
 * POST /api/payments
 * Body: { regNo, obligations, totalAmount, paymentMode, ... }
 */
// const postPayment = async (req, res, next) => {
//   try {
//     // Validate that regNo is provided
//     if (!req.body.regNo) {
//       throw new ApiError(400, 'Registration number (regNo) is required', 'MISSING_REG_NO');
//     }

//     const result = await paymentService.postPayment(req.body);

//     res.status(201).json({
//       success: true,
//       data: result,
//       message: 'Payment posted successfully',
//     });
//   } catch (error) {
//     logger.error('Error posting payment:', error.message);
//     next(error);
//   }
// };





const postPayment = async (req, res, next) => {
  try {
    // Validate that regNo is provided
    if (!req.body.regNo) {
      throw new ApiError(400, 'Registration number (regNo) is required', 'MISSING_REG_NO');
    }

    // If payment mode is bank_transfer, bankName is required
    if (req.body.paymentMode === 'bank_transfer' && !req.body.bankName) {
      throw new ApiError(400, 'Bank name is required for bank transfers', 'MISSING_BANK_NAME');
    }

    const result = await paymentService.postPayment(req.body);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Payment posted successfully',
    });
  } catch (error) {
    logger.error('Error posting payment:', error.message);
    next(error);
  }
};





/**
 * Generate receipt
 * POST /api/receipts/:obligationId/generate
 */
const generateReceipt = async (req, res, next) => {
  try {
    const { obligationId } = req.params;
    const receipt = await paymentService.generateReceipt(obligationId);

    res.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    logger.error('Error generating receipt:', error.message);
    next(error);
  }
};

/**
 * Reverse a payment
 * POST /api/payments/:id/reverse
 */
const reversePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reversedBy, notes } = req.body;

    if (!reversedBy) {
      throw new ApiError(400, 'reversedBy is required', 'MISSING_REVERSED_BY');
    }

    const result = await paymentService.reversePayment(
      id,
      reversedBy,
      notes,
      req.ip,
      req.headers['user-agent']
    );

    res.json({
      success: true,
      data: result,
      message: 'Payment reversed successfully',
    });
  } catch (error) {
    logger.error('Error reversing payment:', error.message);
    next(error);
  }
};

/**
 * Get payments by registration number
 * GET /api/payments?regNo=2380AB/2023
 */
const getByRegNo = async (req, res, next) => {
  try {
    const { regNo } = req.query;

    if (!regNo) {
      throw new ApiError(400, 'regNo query parameter is required', 'MISSING_REG_NO');
    }

    const normalizedRegNo = normalizeRegNo(regNo);
    const payments = await paymentService.getPaymentsByRegNo(normalizedRegNo);

    res.json({
      success: true,
      data: payments,
      count: payments.length,
    });
  } catch (error) {
    logger.error('Error fetching payments by regNo:', error.message);
    next(error);
  }
};

/**
 * Get payments by student ID (deprecated - kept for backward compatibility)
 * GET /api/payments/student/:studentId
 */
const getByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    // Normalize student ID (treat as regNo format)
    const normalized = normalizeRegNo(studentId);
    const payments = await paymentService.getPaymentsByStudent(normalized);

    res.json({
      success: true,
      data: payments,
      count: payments.length,
    });
  } catch (error) {
    logger.error('Error fetching payments by student ID:', error.message);
    next(error);
  }
};

/**
 * Get payment by ID
 * GET /api/payments/:id
 */
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.getPaymentById(id);

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    logger.error('Error fetching payment:', error.message);
    next(error);
  }
};

module.exports = {
  postPayment,
  generateReceipt,
  reversePayment,
  getByRegNo,
  getByStudent,
  getById,
};