require('dotenv').config()

const express = require('express')
const app = express()
const db = require('./Database/models')
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const logFilePath = path.resolve(__dirname, './logs/b2transfer.log');

const PORT = process.env.PORT || 4000

if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: ['http://localhost:3000']
  }))
}
app.use(express.json())

// app.use('/api/upload',require('./routes/multiple_uploads'))
app.use('/api/upload', require('./routes/uploads'))
app.use('/api/b2', require('./routes/upload_tob2'))
// app.use('/api',require('./routes/single_upload'))
app.use('/api/files', require('./routes/view_files'))

app.use('/api/delete_file', require('./routes/delete_route'))

app.get('/', (req, res) => {
  res.json({ successMessage: 'FILE_GATEWAY SERVICE ACTIVE' })
})

app.get('/api/cron-logs', (req, res) => {
  res.sendFile(logFilePath);
});


db.sequelize
  .authenticate()
  .then(() => {
    console.log('SuccessDB')
    return db.sequelize.sync()
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log('fileGate service active-',PORT)
    })
  })
  .catch(err => {
    console.log(err)
  })