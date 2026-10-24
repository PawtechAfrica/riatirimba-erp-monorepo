// const express = require('express')
// const router = express.Router()
// const { Vouchers } = require('../database/models')
// const { generateVoucherPDF } = require('../services/pdfService')
// const ntw = require('number-to-words')
// const { generateSerials } = require('../config/voucherSerial')
// const verifyJwt = require('../middlewares/verifyJWT')
// const { asyncHandler } = require('../middlewares/errorHandler')

// // ─── Helper Functions ──────────────────────────────────────────────────────────

// function computeAmount (lineItems = []) {
//   if (!Array.isArray(lineItems)) lineItems = []

//   const rawKshs = lineItems.reduce((s, r) => s + (Number(r.kshs) || 0), 0)
//   const rawCts = lineItems.reduce((s, r) => s + (Number(r.cts) || 0), 0)

//   const totalCts = rawCts % 100
//   const totalKshs = rawKshs + Math.floor(rawCts / 100)

//   return {
//     totalKshs,
//     totalCts,
//     amountInWords: toKshWords(totalKshs, totalCts),
//     receivedSum: toKshWords(totalKshs, totalCts)
//   }
// }

// function toKshWords (kshs, cts) {
//   if (!kshs && !cts) return 'Kenya Shillings Zero Only'
//   const capitalise = s => s.replace(/\b\w/g, c => c.toUpperCase())
//   let words = 'Kenya Shillings ' + capitalise(ntw.toWords(kshs))
//   if (cts > 0) words += ' and ' + capitalise(ntw.toWords(cts)) + ' Cents'
//   return words + ' Only'
// }

// async function generateVoucherNumber () {
//   const last = await Vouchers.findOne({ order: [['id', 'DESC']] })
//   const [voucherNo] = await generateSerials(last ? last.voucherNo : null, 1)
//   return voucherNo
// }

// // Converts an empty string / undefined to null so Sequelize DATEONLY columns
// // don't choke on ''. Callers are responsible for checking required dates first.
// function sanitizeDate (value) {
//   if (value === '' || value === null || value === undefined) return null
//   return value
// }

// // Shared payment-method validation used by both create and update.
// // Returns an error message string, or null if valid.
// function validatePaymentMethod (paymentMethod, paymentDetails) {
//   if (!paymentMethod) return null

//   if (paymentMethod === 'CASH') {
//     if (!paymentDetails || parseFloat(paymentDetails) <= 0) {
//       return 'Cash amount is required and must be greater than 0'
//     }
//   } else if (paymentMethod === 'ONLINE') {
//     // EFT reference is optional for Online payments — nothing to validate.
//   } else if (['KCB_OPERATIONS', 'KCB_DEVELOPMENT', 'EQUITY_BANK'].includes(paymentMethod)) {
//     if (!paymentDetails || paymentDetails.length !== 4) {
//       return `4-digit cheque number is required for ${paymentMethod}`
//     }
//     if (!/^\d{4}$/.test(paymentDetails)) {
//       return 'Cheque number must be exactly 4 digits'
//     }
//   }

//   return null
// }

// // ─── Routes ──────────────────────────────────────────────────────────────────

// router.get(
//   '/',
//   verifyJwt('view_vouchers')
//   ,
//   asyncHandler(async (req, res) => {
//     const vouchers = await Vouchers.findAll({
//       attributes: [
//         'id',
//         'voucherNo',
//         'date',
//         'payeeName',
//         'amountInWords',
//         'paymentMethod',
//         'paymentDetails',
//         'createdAt'
//       ],
//       order: [['id', 'DESC']]
//     })
//     res.json(vouchers)
//   })
// )

// router.get(
//   '/:id',
//   verifyJwt('view_vouchers'),
//   asyncHandler(async (req, res) => {
//     const voucher = await Vouchers.findByPk(req.params.id)
//     if (!voucher) {
//       return res.status(404).json({ error: 'Voucher not found' })
//     }
//     res.json(voucher)
//   })
// )

// router.post(
//   '/',
//   verifyJwt('create_voucher'),
//   asyncHandler(async (req, res) => {
//     if (!req.body.date) {
//       return res.status(400).json({ error: 'Date is required' })
//     }

//     const validationError = validatePaymentMethod(
//       req.body.paymentMethod,
//       req.body.paymentDetails
//     )
//     if (validationError) {
//       return res.status(400).json({ error: validationError })
//     }

//     const voucherNo = await generateVoucherNumber()
//     const { amountInWords, receivedSum } = computeAmount(req.body.lineItems || [])

//     const voucher = await Vouchers.create({
//       ...req.body,
//       voucherNo,
//       amountInWords,
//       receivedSum,
//       date: sanitizeDate(req.body.date),
//       preparedDate: sanitizeDate(req.body.preparedDate),
//       approvedDate: sanitizeDate(req.body.approvedDate),
//       receivedDate: sanitizeDate(req.body.receivedDate),
//       authorizedDate: sanitizeDate(req.body.authorizedDate)
//     })

//     const createdVoucher = await Vouchers.findByPk(voucher.id)
//     res.status(201).json(createdVoucher)
//   })
// )

// router.put(
//   '/:id',
//   asyncHandler(async (req, res) => {
//     const voucher = await Vouchers.findByPk(req.params.id)
//     if (!voucher) {
//       return res.status(404).json({ error: 'Voucher not found' })
//     }

//     const validationError = validatePaymentMethod(
//       req.body.paymentMethod,
//       req.body.paymentDetails
//     )
//     if (validationError) {
//       return res.status(400).json({ error: validationError })
//     }

//     const { amountInWords, receivedSum } = computeAmount(
//       req.body.lineItems || voucher.lineItems || []
//     )

//     const updateData = {
//       ...req.body,
//       amountInWords,
//       receivedSum
//     }

//     // A date field explicitly sent as '' means "clear it" for the optional
//     // date columns; the primary `date` field stays required.
//     if ('date' in req.body) {
//       if (!req.body.date) {
//         return res.status(400).json({ error: 'Date cannot be empty' })
//       }
//       updateData.date = sanitizeDate(req.body.date)
//     }
//     if ('preparedDate' in req.body) updateData.preparedDate = sanitizeDate(req.body.preparedDate)
//     if ('approvedDate' in req.body) updateData.approvedDate = sanitizeDate(req.body.approvedDate)
//     if ('receivedDate' in req.body) updateData.receivedDate = sanitizeDate(req.body.receivedDate)
//     if ('authorizedDate' in req.body) updateData.authorizedDate = sanitizeDate(req.body.authorizedDate)

//     // Fields that shouldn't be updated directly
//     delete updateData.id
//     delete updateData.createdAt
//     delete updateData.updatedAt
//     delete updateData.voucherNo

//     await voucher.update(updateData)

//     const updatedVoucher = await Vouchers.findByPk(voucher.id)
//     res.json(updatedVoucher)
//   })
// )

// router.delete(
//   '/:id',
//   asyncHandler(async (req, res) => {
//     const voucher = await Vouchers.findByPk(req.params.id)
//     if (!voucher) {
//       return res.status(404).json({ error: 'Voucher not found' })
//     }

//     const deletedVoucher = voucher.toJSON()
//     await voucher.destroy()
//     res.json({ message: 'Voucher deleted successfully', deletedVoucher })
//   })
// )

// // ─── PDF Endpoint ─────────────────────────────────────────────────────────────

// router.get(
//   '/:id/pdf',
//   asyncHandler(async (req, res) => {
//     const voucher = await Vouchers.findByPk(req.params.id)
//     if (!voucher) {
//       return res.status(404).json({ error: 'Voucher not found' })
//     }

//     res.setHeader('Content-Type', 'application/pdf')
//     res.setHeader(
//       'Content-Disposition',
//       `inline; filename="${voucher.voucherNo}.pdf"`
//     )
//     generateVoucherPDF(voucher.toJSON(), res)
//     await voucher.update({ pdfGenerated: true })
//   })
// )

// module.exports = router






































const express = require('express')
const router = express.Router()
const { Vouchers, Voteheads, VoucherBudgetLines, sequelize } = require('../database/models')
const { generateVoucherPDF } = require('../services/pdfService')
const ntw = require('number-to-words')
const { generateSerials } = require('../config/voucherSerial')
const verifyJwt = require('../middlewares/verifyJWT')
const { asyncHandler } = require('../middlewares/errorHandler')
const { AppError } = require('../utils/appError')
const { getPagination, buildPaginatedResponse } = require('../utils/paginate')

// ─── Helper Functions ──────────────────────────────────────────────────────────

function computeAmount (lineItems = []) {
  if (!Array.isArray(lineItems)) lineItems = []

  const rawKshs = lineItems.reduce((s, r) => s + (Number(r.kshs) || 0), 0)
  const rawCts = lineItems.reduce((s, r) => s + (Number(r.cts) || 0), 0)

  const totalCts = rawCts % 100
  const totalKshs = rawKshs + Math.floor(rawCts / 100)

  return {
    totalKshs,
    totalCts,
    amountInWords: toKshWords(totalKshs, totalCts),
    receivedSum: toKshWords(totalKshs, totalCts)
  }
}

function toKshWords (kshs, cts) {
  if (!kshs && !cts) return 'Kenya Shillings Zero Only'
  const capitalise = s => s.replace(/\b\w/g, c => c.toUpperCase())
  let words = 'Kenya Shillings ' + capitalise(ntw.toWords(kshs))
  if (cts > 0) words += ' and ' + capitalise(ntw.toWords(cts)) + ' Cents'
  return words + ' Only'
}

async function generateVoucherNumber () {
  const last = await Vouchers.findOne({ order: [['id', 'DESC']] })
  const [voucherNo] = await generateSerials(last ? last.voucherNo : null, 1)
  return voucherNo
}

// Converts an empty string / undefined to null so Sequelize DATEONLY columns
// don't choke on ''. Callers are responsible for checking required dates first.
function sanitizeDate (value) {
  if (value === '' || value === null || value === undefined) return null
  return value
}

// Shared payment-method validation used by both create and update.
// Returns an error message string, or null if valid.
function validatePaymentMethod (paymentMethod, paymentDetails) {
  if (!paymentMethod) return null

  if (paymentMethod === 'CASH') {
    if (!paymentDetails || parseFloat(paymentDetails) <= 0) {
      return 'Cash amount is required and must be greater than 0'
    }
  } else if (paymentMethod === 'ONLINE') {
    // EFT reference is optional for Online payments — nothing to validate.
  } else if (['KCB_OPERATIONS', 'KCB_DEVELOPMENT', 'EQUITY_BANK'].includes(paymentMethod)) {
    if (!paymentDetails || paymentDetails.length !== 4) {
      return `4-digit cheque number is required for ${paymentMethod}`
    }
    if (!/^\d{4}$/.test(paymentDetails)) {
      return 'Cheque number must be exactly 4 digits'
    }
  }

  return null
}

// Applies budgetDetails against Voteheads inside an existing transaction.
// budgetDetails: [{ voteheadId, thisPay }, ...]
// Locks each Votehead row (FOR UPDATE) to prevent race conditions between
// concurrent vouchers drawing from the same votehead.
async function applyBudgetLines (voucherId, budgetDetails = [], t) {
  if (!Array.isArray(budgetDetails) || budgetDetails.length === 0) return

  for (const line of budgetDetails) {
    const voteheadId = line.voteheadId
    const thisPay = Number(line.thisPay) || 0

    if (!voteheadId) throw new AppError('Each budget line requires a voteheadId', 400)
    if (thisPay <= 0) throw new AppError('thisPay must be greater than 0', 400)

    const votehead = await Voteheads.findByPk(voteheadId, {
      lock: t.LOCK.UPDATE,
      transaction: t
    })
    if (!votehead) throw new AppError(`Votehead ${voteheadId} not found`, 404)

    const balBefore = Number(votehead.balAvailable)
    if (thisPay > balBefore) {
      throw new AppError(
        `Insufficient balance on votehead "${votehead.name}": available ${balBefore}, requested ${thisPay}`,
        400
      )
    }

    const uncommittedBal = balBefore - thisPay

    await VoucherBudgetLines.create(
      { voucherId, voteheadId, balBefore, thisPay, uncommittedBal },
      { transaction: t }
    )

    await votehead.update({ balAvailable: uncommittedBal }, { transaction: t })
  }
}

// Reverses previously-applied budget lines for a voucher — restores each
// Votehead's balAvailable and deletes the line records. Used on voucher
// update (before reapplying new lines) and on delete.
async function reverseBudgetLines (voucherId, t) {
  const existingLines = await VoucherBudgetLines.findAll({
    where: { voucherId },
    transaction: t,
    lock: t.LOCK.UPDATE
  })

  for (const line of existingLines) {
    const votehead = await Voteheads.findByPk(line.voteheadId, {
      lock: t.LOCK.UPDATE,
      transaction: t
    })
    if (votehead) {
      await votehead.update(
        { balAvailable: Number(votehead.balAvailable) + Number(line.thisPay) },
        { transaction: t }
      )
    }
  }

  await VoucherBudgetLines.destroy({ where: { voucherId }, transaction: t })
}

const budgetIncludes = [{ model: VoucherBudgetLines, include: [Voteheads] }]

// ─── Routes ──────────────────────────────────────────────────────────────────

router.get(
  '/',
  verifyJwt('view_vouchers'),
  asyncHandler(async (req, res) => {
    const vouchers = await Vouchers.findAll({
      attributes: [
        'id',
        'voucherNo',
        'date',
        'payeeName',
        'amountInWords',
        'paymentMethod',
        'paymentDetails',
        'createdAt'
      ],
      order: [['id', 'DESC']]
    })
    res.json(vouchers)
  })
)

router.get(
  '/:id',
  verifyJwt('view_vouchers'),
  asyncHandler(async (req, res) => {
    const voucher = await Vouchers.findByPk(req.params.id, { include: budgetIncludes })
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' })
    }
    res.json(voucher)
  })
)

router.post(
  '/',
  verifyJwt('create_voucher'),
  asyncHandler(async (req, res) => {
    if (!req.body.date) {
      return res.status(400).json({ error: 'Date is required' })
    }

    const validationError = validatePaymentMethod(
      req.body.paymentMethod,
      req.body.paymentDetails
    )
    if (validationError) {
      return res.status(400).json({ error: validationError })
    }

    const voucherId = await sequelize.transaction(async (t) => {
      const voucherNo = await generateVoucherNumber()
      const { amountInWords, receivedSum } = computeAmount(req.body.lineItems || [])

      const voucher = await Vouchers.create(
        {
          ...req.body,
          voucherNo,
          amountInWords,
          receivedSum,
          date: sanitizeDate(req.body.date),
          preparedDate: sanitizeDate(req.body.preparedDate),
          approvedDate: sanitizeDate(req.body.approvedDate),
          receivedDate: sanitizeDate(req.body.receivedDate),
          authorizedDate: sanitizeDate(req.body.authorizedDate)
        },
        { transaction: t }
      )

      await applyBudgetLines(voucher.id, req.body.budgetDetails, t)

      return voucher.id
    })

    const createdVoucher = await Vouchers.findByPk(voucherId, { include: budgetIncludes })
    res.status(201).json(createdVoucher)
  })
)

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const voucher = await Vouchers.findByPk(req.params.id)
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' })
    }

    const validationError = validatePaymentMethod(
      req.body.paymentMethod,
      req.body.paymentDetails
    )
    if (validationError) {
      return res.status(400).json({ error: validationError })
    }

    await sequelize.transaction(async (t) => {
      const { amountInWords, receivedSum } = computeAmount(
        req.body.lineItems || voucher.lineItems || []
      )

      const updateData = {
        ...req.body,
        amountInWords,
        receivedSum
      }

      if ('date' in req.body) {
        if (!req.body.date) throw new AppError('Date cannot be empty', 400)
        updateData.date = sanitizeDate(req.body.date)
      }
      if ('preparedDate' in req.body) updateData.preparedDate = sanitizeDate(req.body.preparedDate)
      if ('approvedDate' in req.body) updateData.approvedDate = sanitizeDate(req.body.approvedDate)
      if ('receivedDate' in req.body) updateData.receivedDate = sanitizeDate(req.body.receivedDate)
      if ('authorizedDate' in req.body) updateData.authorizedDate = sanitizeDate(req.body.authorizedDate)

      // Fields that shouldn't be updated directly
      delete updateData.id
      delete updateData.createdAt
      delete updateData.updatedAt
      delete updateData.voucherNo
      delete updateData.budgetDetails // handled separately below

      await voucher.update(updateData, { transaction: t })

      // Only touch budget lines if the client actually sent budgetDetails
      if ('budgetDetails' in req.body) {
        await reverseBudgetLines(voucher.id, t)
        await applyBudgetLines(voucher.id, req.body.budgetDetails, t)
      }
    })

    const updatedVoucher = await Vouchers.findByPk(voucher.id, { include: budgetIncludes })
    res.json(updatedVoucher)
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const voucher = await Vouchers.findByPk(req.params.id)
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' })
    }

    const deletedVoucher = voucher.toJSON()

    await sequelize.transaction(async (t) => {
      await reverseBudgetLines(voucher.id, t)
      await voucher.destroy({ transaction: t })
    })

    res.json({ message: 'Voucher deleted successfully', deletedVoucher })
  })
)

// ─── PDF Endpoint ─────────────────────────────────────────────────────────────

router.get(
  '/:id/pdf',
  asyncHandler(async (req, res) => {
    const voucher = await Vouchers.findByPk(req.params.id, { include: budgetIncludes })
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' })
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${voucher.voucherNo}.pdf"`
    )
    generateVoucherPDF(voucher.toJSON(), res)
    await voucher.update({ pdfGenerated: true })
  })
)


// pagination
router.get(
  '/',
  verifyJwt('view_vouchers'),
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset, limit } = getPagination(req.query)

    const { count, rows } = await Vouchers.findAndCountAll({
      attributes: [
        'id',
        'voucherNo',
        'date',
        'payeeName',
        'amountInWords',
        'paymentMethod',
        'paymentDetails',
        'createdAt'
      ],
      order: [['id', 'DESC']],
      limit,
      offset
    })

    res.json(buildPaginatedResponse(page, pageSize, count, rows))
  })
)

module.exports = router