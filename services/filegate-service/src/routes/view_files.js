const express = require('express')
const router = express.Router()
const { generateSignedUrl } = require('../utils/b2_scripts')

const { Files } = require('../Database/models')

router.get('/', async (req, res) => {
  try {
    const files = await Files.findAll({
      // attributes: ['id', 'name']
      attributes: ['id', 'originalName','fieldName', 'b2FileName', 'status']

    })
    res.json(files)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not fetch files' })
  }
})

// Route to get signed URL for one file
router.get('/:fileName', async (req, res) => {
  const fileName = req.params.fileName
  try {

    // const file = await Files.findByPk(req.params.id)
    // if (!file) {
    //   return res.status(404).json({ error: 'File not found' })
    // }

    // const signedUrl = await generateSignedUrl('Riatirimba', file.b2FileName)
    const signedUrl = await generateSignedUrl('Riatirimba', fileName)
    // res.json({ name: file.originalName, url: signedUrl })
    res.json({ url: signedUrl })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not generate URL' })
  }
})




// router.get("/download/:fileName", async (req, res) => {
//   const { fileName } = req.params;
//   try {
//     const signedUrl = await generateSignedUrl("Riatirimba", fileName);

//     const response = await fetch(signedUrl); // native Node.js fetch
//     if (!response.ok) {
//       return res.status(response.status).send("Error fetching file");
//     }

//     res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");
//     res.setHeader("Access-Control-Allow-Origin", "*");

//     response.body.pipe(res); // stream to client
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Could not download file" });
//   }
// });


module.exports = router
