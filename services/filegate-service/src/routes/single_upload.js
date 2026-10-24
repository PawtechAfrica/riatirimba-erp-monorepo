const express = require('express');
const router = express.Router();
const { b2Authorize } = require('../utils/b2_scripts');
const multer = require('multer')
const { Files } = require('../Database/models')
const path = require('path')
const fs = require('fs')



const upload = multer({ dest: 'uploads/' })


router.post('/upload', upload.single('file'), async (req, res) => {
  
  try {
    await b2Authorize();

    const filePath = req.file.path
    const fileName = req.file.originalname
    const fileBuffer = fs.readFileSync(filePath)

    // Get upload URL
    const { data: uploadUrlData } = await b2.getUploadUrl({
      bucketId: '74dbe2da76b0933c9b8c0d1e'
    })

    // Upload file
    await b2.uploadFile({
      uploadUrl: uploadUrlData.uploadUrl,
      uploadAuthToken: uploadUrlData.authorizationToken,
      fileName: fileName,
      data: fileBuffer
    })

    // File URL
    const fileUrl = `${'https://Riatirimba.s3.us-west-004.backblazeb2.com'}/${encodeURIComponent(
      fileName
    )}`

    // Save to DB
    const savedFile = await Files.create({ name: fileName, url: fileUrl })

    // Cleanup local file
    fs.unlinkSync(filePath)

    res.json({ message: 'File uploaded', file: savedFile })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports={router}