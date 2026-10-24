const B2 = require('backblaze-b2')
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const KEY_ID = process.env.APP_KEY_ID
const APP_KEY = process.env.APP_KEY
const ENDPOINT = process.env.BUCKET_ENDPOINT
const BUCKET_NAME = process.env.BUCKET_NAME
const REGION = process.env.REGION

const b2 = new B2({
  applicationKeyId: KEY_ID || '0044b2a603cbcde0000000001',
  applicationKey: APP_KEY || 'K0045AfMO/nT0cXrE9/4o0IVrkIqBRE'
})

async function GetBucket () {
  try {
    await b2.authorize() // authorization lasts 24 hrs
    let response = await b2.getBucket({
      bucketName: BUCKET_NAME || 'Riatirimba'
    })
    console.log(response.data)
  } catch (err) {
    console.log('Error getting bucket:', err)
  }
}

// GetBucket()

async function b2Authorize () {
  await b2.authorize()
}

const s3 = new S3Client({
  region: REGION || 'us-west-002',
  endpoint: ENDPOINT || 'https://s3.us-west-004.backblazeb2.com',
  credentials: {
    accessKeyId: KEY_ID || '0044b2a603cbcde0000000001',
    secretAccessKey: APP_KEY || 'K0045AfMO/nT0cXrE9/4o0IVrkIqBRE'
  }
})

// Generate signed URL
async function generateSignedUrl (bucketName, fileName) {
  const command = new GetObjectCommand({ Bucket: bucketName, Key: fileName })
  return await getSignedUrl(s3, command, { expiresIn: 600 })
}

module.exports = {
  b2Authorize,
  GetBucket,
  generateSignedUrl,
  b2
}
