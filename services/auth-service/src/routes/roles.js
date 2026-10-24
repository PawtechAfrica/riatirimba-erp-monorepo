const express = require('express');
const router = express.Router();
const { Roles, Permissions } = require('../../Database/models');

// Get one role + its default permissions
router.get('/:id', async (req, res) => {
  try {
    const role = await Roles.findByPk(req.params.id, {
      include: {
        model: Permissions,
        as: 'permissions',
        through: { attributes: [] },
      }
    });

    if (!role) return res.status(404).json({ error: 'Role not found' });

    res.json({
      id: role.id,
      role: role.role,
      defaultPermissions: role.permissions.map(p => ({
        id: p.id,
        name: p.name,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

module.exports = router;
