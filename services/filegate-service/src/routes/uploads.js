const express = require('express')
const router = express.Router()
const multer = require('multer')
const { Files } = require('../Database/models')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')


const uploadDir = path.join(__dirname, '..', '..', 'uploads');//from the root


if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); 
    const baseName = path.basename(file.originalname, ext); 
    const uniqueName = `${uuidv4()}-${baseName}${ext}`;
    cb(null, uniqueName);
  }
});


const upload = multer({ storage })

router.post('/', upload.any(), async (req, res) => {
  
  try {
    const savedFiles = []


    for (const file of req.files) {
        // console.log(file)
      const savedFile = await Files.create({
        originalName: file.originalname,
        fieldName:file.fieldname,
        storagePath: file.path,
        mimeType: file.mimetype,
        size: file.size,
        status: 'pending'
      })

      savedFiles.push({
        field: file.fieldname,
        file: savedFile,
        b2FileName:path.basename(file.path)
      })
    }   

    res.json({
      message: 'Files stored locally and indexed in DB',
      files: savedFiles
    })
  } catch (error) {
    console.error('Error saving files:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
