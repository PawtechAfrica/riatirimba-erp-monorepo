const express = require('express')
const router = express.Router()
const paymentController = require('../controllers/payment.controller')
const { validate } = require('../validators')
const {
  paymentSchema,
  reversePaymentSchema
} = require('../validators/payment.validator')

router.post('/', validate(paymentSchema), paymentController.postPayment)
router.get('/', paymentController.getByRegNo)
router.get('/:id', paymentController.getById)
router.post(
  '/:id/reverse',
  validate(reversePaymentSchema),
  paymentController.reversePayment
)
router.post(
  '/receipts/:obligationId/generate',
  paymentController.generateReceipt
)

module.exports = router
