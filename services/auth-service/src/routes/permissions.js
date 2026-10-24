const express = require('express');
const router = express.Router();
const { Permissions } = require('../../Database/models');

// Get all permissions
router.get('/', async (req, res) => {
  try {
    const permissions = await Permissions.findAll();
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one permission
router.get('/:id', async (req, res) => {
  try {
    const permission = await Permissions.findByPk(req.params.id);
    if (!permission) return res.status(404).json({ message: 'Not found' });
    res.json(permission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new permission
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const newPermission = await Permissions.create({ name, description });
    res.status(201).json(newPermission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a permission
router.patch('/:id', async (req, res) => {
  try {
    const permission = await Permissions.findByPk(req.params.id);
    if (!permission) return res.status(404).json({ message: 'Not found' });

    const { name, description } = req.body;
    await permission.update({ name, description });
    res.json(permission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a permission
router.delete('/:id', async (req, res) => {
  try {
    const permission = await Permissions.findByPk(req.params.id);
    if (!permission) return res.status(404).json({ message: 'Not found' });

    await permission.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
