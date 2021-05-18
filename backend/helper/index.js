const path = require('path')

exports.exec = require(path.resolve('helper', 'exec'))
exports.random = require(path.resolve('helper', 'random'))
exports.storage = require(path.resolve('helper', 'storage'))
exports.submissionhandler = require(path.resolve('helper', 'submissionhandler'))
exports.oldformpropshandler = require(path.resolve(
  'helper',
  'oldformpropshandler'
))
