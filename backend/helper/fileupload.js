const path = require('path')
const {Storage} = require('@google-cloud/storage');

const storage = new Storage({
  keyFilename: path.join(__dirname, '../formpress-2bb91771c29b.json'),
  projectId: 'formpress'
});

storage.getBuckets().then(x => console.log(x))
const fileUploadBucket = storage.bucket('formpress-stage-test-fileuploads')

exports.uploadFile = (localFilePath) => {
  const fileName = path.basename(localFilePath)
  const file = fileUploadBucket.file(fileName)

  return fileUploadBucket.upload(localFilePath.split('/').pop())
    .then(() => file.makePublic())
    .then(() => exports.getPublicUrl(fileName))
}

exports.getPublicUrl = (fileName) => `https://storage.googleapis.com/${fileUploadBucket}/${fileName}`