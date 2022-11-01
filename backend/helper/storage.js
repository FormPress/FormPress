const { Storage } = require('@google-cloud/storage')
const { v4: uuidv4 } = require('uuid')
const { Duplex, PassThrough } = require('stream')
const path = require('path')
const { error } = require(path.resolve('helper'))

const storage = new Storage({
  keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT_KEYFILE,
  projectId: 'formpress'
})
const fileUploadBucket = storage.bucket(process.env.FILE_UPLOAD_BUCKET)

exports.uploadFile = (uploadedFile, submit_id) => {
  let trMap = {
    çÇ: 'c',
    ğĞ: 'g',
    şŞ: 's',
    üÜ: 'u',
    ıİ: 'i',
    öÖ: 'o',
    ' ': '_'
  }
  let newName = ''
  let uploadedFiles = []
  let results = []
  if (uploadedFile instanceof Array) {
    uploadedFiles = uploadedFile
  } else {
    uploadedFiles.push(uploadedFile)
  }
  for (let eachFile of uploadedFiles) {
    let fileExtension = ''
    if (eachFile.name.indexOf('.') > -1) {
      fileExtension = eachFile.name.match(/\.[^.]+$/)[0]
    }
    let fileName = submit_id.toString() + '/' + uuidv4() + fileExtension
    let file = fileUploadBucket.file(fileName)
    let size = eachFile.size
    new Promise((resolve, reject) => {
      let stream = new Duplex()

      stream.push(eachFile.data)
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

    for (let key in trMap) {
      newName = eachFile.name
        .substring(0, eachFile.name.lastIndexOf('.'))
        .replace(new RegExp('[' + key + ']', 'g'), trMap[key])
    }

    newName = newName
      .replace(/[^-a-zA-Z0-9\s]+/gi, '')
      .replace(/\s/gi, '-')
      .replace(/[-]+/gi, '-')
      .toLowerCase()

    results.push({
      uploadName: fileName,
      fileName: `${newName}${fileExtension}`,
      fileSize: size
    })
  }
  return JSON.stringify(results)
}

exports.uploadFileForRte = async (uploadedFile, form_id, question_id) => {
  let fileExtension = ''
  if (uploadedFile.file.name.indexOf('.') > -1) {
    fileExtension = uploadedFile.file.name.match(/\.[^.]+$/)[0]
  }

  const fileName =
    'rte/' + form_id + '/' + question_id + '/' + uuidv4() + fileExtension

  let file = fileUploadBucket.file(fileName)

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
    location: `https://storage.googleapis.com/${fileUploadBucket.name}/${fileName}`
  }
}

exports.checkIfFileIsExist = async (uploadName) => {
  return fileUploadBucket.file(uploadName).exists()
}

exports.downloadFile = async (uploadName) => {
  const fileToDownload = fileUploadBucket.file(uploadName)
  const out = new PassThrough()
  fileToDownload
    .createReadStream()
    .on('error', function (err) {
      console.log('Could not download file', err)
      error.errorReport(err)
    })
    .pipe(out)

  return out
}

exports.deleteFile = (uploadName) => {
  try {
    fileUploadBucket.file(uploadName).delete()
  } catch (err) {
    console.log('cannot delete uploaded file', err)
    error.errorReport(err)
  }
}
