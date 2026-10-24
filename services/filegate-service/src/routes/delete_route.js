const express = require('express')
const router = express.Router()

const { deleteFile } = require('../utils/delete_scripts')

const bucketId = process.env.BUCKET_ID || "74dbe2da76b0933c9b8c0d1e"

router.post('/', async (req, res) => {
  const { b2FileName } = req.body

  if (!b2FileName) {
    return res.status(400).json({ error: 'Missing file name (b2FileName)' })
  }

  // console.log('DELETE SEQUENCE INNIT')

  try {
    const response = await deleteFile(bucketId, b2FileName)
    if (!response) {
      return res.status(404).json({ error: 'File not found' })
    }

    res.json({ data: response });

  } catch (error) { 
     console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

module.exports = router
