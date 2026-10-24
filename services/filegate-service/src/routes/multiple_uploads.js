const express = require('express')
const router = express.Router()
const multer = require('multer')
const { Files } = require('../Database/models')
const { b2Authorize, b2 } = require('../utils/b2_scripts')
const path = require('path')
const fs = require('fs')

const upload = multer({ dest: 'uploads/' })

router.post('/', upload.array('files', 6), async (req, res) => {
  try {
    await b2Authorize()

    const uploadedFiles = []

    for (const file of req.files) {
      const filePath = file.path
      const fileName = file.originalname
      const fileBuffer = fs.readFileSync(filePath)

      // Get upload URL
      const { data: uploadUrlData } = await b2.getUploadUrl({
        bucketId: '74dbe2da76b0933c9b8c0d1e'
      })

      // Upload to B2
      await b2.uploadFile({
        uploadUrl: uploadUrlData.uploadUrl,
        uploadAuthToken: uploadUrlData.authorizationToken,
        fileName,
        data: fileBuffer
      })

      // Save to DB
      const fileUrl = `https://Riatirimba.s3.us-west-004.backblazeb2.com/${encodeURIComponent(
        fileName
      )}`
      const savedFile = await Files.create({ name: fileName, url: fileUrl })
      uploadedFiles.push(savedFile)

      // Delete local file
      fs.unlinkSync(filePath)
    }

    res.json({ message: 'Files uploaded', files: uploadedFiles })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
