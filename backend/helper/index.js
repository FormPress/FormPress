const path = require('path')
const isEnvironmentVariableSet = {
  fileUploadBucket: process.env.FILE_UPLOAD_BUCKET !== ''
}

exports.exec = require(path.resolve('helper', 'exec'))
exports.random = require(path.resolve('helper', 'random'))
exports.submissionhandler = require(path.resolve('helper', 'submissionhandler'))
exports.model = require(path.resolve('helper', 'model'))
exports.error = require(path.resolve('helper', 'error'))
exports.testStringIsJson = require(path.resolve('helper', 'testStringIsJson'))
exports.token = require(path.resolve('helper', 'token'))
exports.pdfPrinter = require(path.resolve('helper', 'pdfPrinter'))
exports.stringTools = require(path.resolve('helper', 'stringTools'))

exports.storage = ''

if (isEnvironmentVariableSet.fileUploadBucket) {
  exports.storage = require(path.resolve('helper', 'storage'))
}
