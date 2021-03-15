const { Storage } = require('@google-cloud/storage')
const { v4: uuidv4 } = require('uuid')
const { Duplex } = require('stream')

const storage = new Storage({
  keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT_KEYFILE,
  projectId: 'formpress'
})
const fileUploadBucket = storage.bucket(process.env.FILE_UPLOAD_BUCKET)

exports.uploadFile = (uploadedFile, submit_id) =>
  new Promise((resolve, reject) => {
    let fileExtension = ''
    if (uploadedFile.name.indexOf('.') > -1) {
      fileExtension = uploadedFile.name.match(/\.[^.]+$/)[0]
    }

    const fileName = submit_id.toString() + '/' + uuidv4() + fileExtension
    const file = fileUploadBucket.file(fileName)
    const stream = new Duplex()

    stream.push(uploadedFile.data)
    stream.push(null)

    stream
      .pipe(file.createWriteStream())
      .on('error', (error) => {
        reject(error)
      })
      .on('finish', async () => {
        await file.makePublic() // TODO, lets not make files public by default
        resolve(
          JSON.stringify({
            url: exports.getPublicUrl(fileName),
            fileName: uploadedFile.name
          })
        )
      })
  })

exports.getPublicUrl = (fileName) =>
  `https://storage.googleapis.com/${process.env.FILE_UPLOAD_BUCKET}/${fileName}`
