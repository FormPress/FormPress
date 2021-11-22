const path = require('path')
const isEnvVarSet = {
  Bucket: process.env.FILE_UPLOAD_BUCKET !== ''
}

exports.exec = require(path.resolve('helper', 'exec'))
exports.random = require(path.resolve('helper', 'random'))
exports.submissionhandler = require(path.resolve('helper', 'submissionhandler'))
exports.storage = ''
if (isEnvVarSet.Bucket) {
  exports.storage = require(path.resolve('helper', 'storage'))
}
