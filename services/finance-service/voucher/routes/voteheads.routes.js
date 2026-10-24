const express = require('express')
const router = express.Router()
const { Voteheads } = require('../database/models')
const verifyJwt = require('../middlewares/verifyJWT')
const { asyncHandler } = require('../middlewares/errorHandler')
const { getPagination, buildPaginatedResponse } = require('../utils/paginate')

router.get(
  '/',
  verifyJwt('view_vouchers'),
  asyncHandler(async (req, res) => {
    const voteheads = await Voteheads.findAll({ order: [['name', 'ASC']] })
    res.json(voteheads)
  })
)

router.post(
  '/',
  verifyJwt('manage_voteheads'),
  asyncHandler(async (req, res) => {
    const { code, name, allocation } = req.body
    if (!name) return res.status(400).json({ error: 'Votehead name is required' })

    const votehead = await Voteheads.create({
      code,
      name,
      allocation: Number(allocation) || 0,
      balAvailable: Number(allocation) || 0 // starts fully available
    })
    res.status(201).json(votehead)
  })
)

router.put(
  '/:id',
  verifyJwt('manage_voteheads'),
  asyncHandler(async (req, res) => {
    const votehead = await Voteheads.findByPk(req.params.id)
    if (!votehead) return res.status(404).json({ error: 'Votehead not found' })

    const { code, name, allocation, balAvailable } = req.body
    await votehead.update({
      ...(code !== undefined && { code }),
      ...(name !== undefined && { name }),
      ...(allocation !== undefined && { allocation }),
      ...(balAvailable !== undefined && { balAvailable })
    })
    res.json(votehead)
  })
)

// pagination
router.get(
  '/',
  verifyJwt('view_vouchers'),
  asyncHandler(async (req, res) => {
    const { page, pageSize, offset, limit } = getPagination(req.query)

    const { count, rows } = await Voteheads.findAndCountAll({
      order: [['name', 'ASC']],
      limit,
      offset
    })

    res.json(buildPaginatedResponse(page, pageSize, count, rows))
  })
)

module.exports = router