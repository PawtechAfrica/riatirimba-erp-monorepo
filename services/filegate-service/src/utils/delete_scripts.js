const { b2 } = require('./b2_scripts')

async function deleteFile (bucketId, fileName) {
  console.log('::::::::::INITIATED::::::::::')
  try {
    await b2.authorize()

    const listResp = await b2.listFileVersions({
      bucketId,
      prefix: fileName,
      maxFileCount: 100
    })

    const file_details = listResp.data.files
    let fileId

    if (!file_details.length) {
      console.log(`File not found: ${fileName}`)
      return
    }

    for (let detail of file_details) {
      if (fileName === detail.fileName) {
        fileId = detail.fileId
      }
    }

    // Delete using fileName + fileId

    try {
      const deleteResp = await b2.deleteFileVersion({
        fileId,
        fileName
      })

      return deleteResp.data
    } catch (error) {
      console.log(error)
    }

   
  } catch (err) {
    // console.error('Error deleting file:', err.message)
    return err
  }
}

// deleteFile(
//   '74dbe2da76b0933c9b8c0d1e',
//   '75599f4b-e2d0-4254-82f3-905b681cfafe-nationalId.pdf'
// )

module.exports = { deleteFile };
