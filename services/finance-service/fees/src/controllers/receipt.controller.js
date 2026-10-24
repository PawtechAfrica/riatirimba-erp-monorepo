const receiptService = require('../services/receipt.service');
const { logger } = require('../utils/logger');
const { ApiError } = require('../middlewares/errorHandler');

/**
 * Generate receipt as PDF (downloadable)
 * GET /api/receipts/:obligationId/pdf
 * Query params:
 *   type=student|sponsor   (default: student)
 *   showStatus=true|false  (default: true) - hides the status badge when 'false'
 */
const getPDF = async (req, res, next) => {
  try {
    const { obligationId } = req.params;
    const type = req.query.type || 'student';
    // ?showStatus=false hides the status badge column/row on the printout.
    // Defaults to true (shown) when the query param is omitted.
    const showStatus = req.query.showStatus === 'false';

    // Validate obligationId
    if (!obligationId || obligationId === 'OBL-xxxxx') {
      throw new ApiError(400, 'Invalid obligation ID provided', 'INVALID_OBLIGATION_ID');
    }

    // Validate type
    const validTypes = ['student', 'sponsor'];
    if (!validTypes.includes(type)) {
      throw new ApiError(400, `Invalid type. Must be one of: ${validTypes.join(', ')}`, 'INVALID_RECEIPT_TYPE');
    }

    logger.info(`Generating ${type} receipt for obligation ${obligationId} (showStatus=${showStatus})`);

    const pdf = await receiptService.getReceiptPDF(obligationId, type, { showStatus });

    const filename = `receipt-${obligationId}-${type}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Length', pdf.length);

    res.send(pdf);
  } catch (error) {
    logger.error('Error generating PDF receipt:', error.message);
    next(error);
  }
};

/**
 * Generate receipt as JSON (for preview)
 * GET /api/receipts/:obligationId/json
 */
const getJSON = async (req, res, next) => {
  try {
    const { obligationId } = req.params;

    if (!obligationId || obligationId === 'OBL-xxxxx') {
      throw new ApiError(400, 'Invalid obligation ID provided', 'INVALID_OBLIGATION_ID');
    }

    const receipt = await receiptService.getReceiptJSON(obligationId);

    res.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    logger.error('Error generating JSON receipt:', error.message);
    next(error);
  }
};

module.exports = {
  getPDF,
  getJSON,
};