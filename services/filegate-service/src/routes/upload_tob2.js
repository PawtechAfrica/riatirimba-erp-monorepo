const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const { Files } = require('../Database/models')
const mime = require('mime-types')

const { b2, b2Authorize } = require('../utils/b2_scripts')

const BUCKET_ID = process.env.BUCKET_ID

function sendLogs() { }

async function b2TransferJob() {
  console.log('B2 TRANSFER STARTED');

  try {
    await b2Authorize();

    const pendingFiles = await Files.findAll({
      where: { status: 'pending' }
    });

    if (pendingFiles.length === 0) {
      // console.log('No pending files to upload');
      return { message: 'No pending files to upload', results: [] };
    }

    const results = [];

    for (const file of pendingFiles) {
      const filePath = path.resolve(file.storagePath);

      if (!fs.existsSync(filePath)) {
        results.push({
          file: file.originalName,
          status: 'error',
          error: 'File not found locally'
        });
        continue;
      }

      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      const mimeType = mime.lookup(filePath) || 'application/octet-stream';

      try {
        // Get upload URL
        const { data: uploadUrlData } = await b2.getUploadUrl({
          bucketId: BUCKET_ID || '74dbe2da76b0933c9b8c0d1e'
        });

        // Upload file
        await b2.uploadFile({
          uploadUrl: uploadUrlData.uploadUrl,
          uploadAuthToken: uploadUrlData.authorizationToken,
          fileName,
          data: fileBuffer,
          mime: mimeType,
          info: {
            'Content-Disposition': 'inline',
            'Content-Type': mimeType
          }
        });

        // Update DB status
        file.b2FileName = fileName;
        file.status = 'uploaded';
        file.uploadedAt = new Date();
        await file.save();

        results.push({
          file: file.originalName,
          status: 'uploaded',
          b2FileName: file.b2FileName
        });

        // Optional: delete local file
        // fs.unlinkSync(filePath);  TODO
      } catch (uploadError) {
        console.error(`Failed to upload ${file.originalName}:`, uploadError.message);
        results.push({
          file: file.originalName,
          status: 'error',
          error: uploadError.message
        });
      }
    }

    sendLogs();
    console.log('Upload process completed');
    return { message: 'Upload process completed', results };

  } catch (err) {
    console.error('B2 Transfer Job Failed:', err.message);
    throw err;
  }
}

// module.exports = { b2TransferJob };





const { scheduleTask } = require('../utils/cron');
const { logMessage } = require('../utils/cron-logger');
const cronExpression = process.env.CRON_EXPRESSION || '*/5 * * * *';


scheduleTask(cronExpression, async () => {
  try {
    let result = await b2TransferJob();
    logMessage(`Result: ${JSON.stringify(result)}`);
  } catch (err) {
    // console.error('Cron job error:', err.message);
    // logMessage(`Result: ${JSON.stringify(result)}`);
    logMessage(`Cron job error: ${err.message}`);
  }
});




// async function b2TransferJob () {
//   // router.get('/', async (req, res) => {

//   console.log('B2 TRANSFER STARTED')

//   try {
//     await b2Authorize()

//     const pendingFiles = await Files.findAll({
//       where: { status: 'pending' }
//     })

//     if (pendingFiles.length === 0) {
//       return res.json({ message: 'No pending files to upload' })
//     }

//     const results = []

//     for (const file of pendingFiles) {
//       const filePath = path.resolve(file.storagePath)

//       if (!fs.existsSync(filePath)) {
//         results.push({
//           file: file.originalName,
//           status: 'error',
//           error: 'File not found locally'
//         })
//         continue
//       }

//       const fileBuffer = fs.readFileSync(filePath)
//       const fileName = path.basename(filePath)
//       const mimeType = mime.lookup(filePath) || 'application/octet-stream'

//       try {
//         // Get upload URL
//         const { data: uploadUrlData } = await b2.getUploadUrl({
//           bucketId: BUCKET_ID || '74dbe2da76b0933c9b8c0d1e'
//         })

//         // Upload file
//         await b2.uploadFile({
//           uploadUrl: uploadUrlData.uploadUrl,
//           uploadAuthToken: uploadUrlData.authorizationToken,
//           fileName,
//           data: fileBuffer,
//           mime: mimeType
//         })

//         // Update DB status
//         file.b2FileName = fileName
//         file.status = 'uploaded'
//         file.uploadedAt = new Date()
//         await file.save()

//         results.push({
//           file: file.originalName,
//           status: 'uploaded',
//           b2FileName: file.b2FileName
//         })

//         // Optional: delete local file
//         // fs.unlinkSync(filePath);
//       } catch (uploadError) {
//         console.error(
//           `Failed to upload ${file.originalName}:`,
//           uploadError.message
//         )
//         results.push({
//           file: file.originalName,
//           status: 'error',
//           error: uploadError.message
//         })
//       }
//     }

//     sendLogs()
//     res.json({ message: 'Upload process completed', results })
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ error: err.message })
//   }
//   // })
// }



module.exports = router
