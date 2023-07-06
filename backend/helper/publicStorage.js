const { Storage } = require('@google-cloud/storage')
const { v4: uuidv4 } = require('uuid')
const { Duplex } = require('stream')
const storage = new Storage()
const publicBucket = storage.bucket(process.env.PUBLIC_BUCKET)

exports.uploadFileForRte = async (uploadedFile, form_id, question_id) => {
  let fileExtension = ''
  if (uploadedFile.file.name.indexOf('.') > -1) {
    fileExtension = uploadedFile.file.name.match(/\.[^.]+$/)[0]
  }

  const fileName =
    'rte/' + form_id + '/' + question_id + '/' + uuidv4() + fileExtension

  let file = publicBucket.file(fileName)

  new Promise((resolve, reject) => {
    let stream = new Duplex()

    stream.push(uploadedFile.file.data)
    stream.push(null)

    stream
      .pipe(file.createWriteStream())
      .on('error', (error) => {
        reject(error)
      })
      .on('finish', () => {
        resolve()
      })
  })

  return {
    location: `https://storage.googleapis.com/${publicBucket.name}/${fileName}`
  }
}
