const path = require('path')

exports.FormModel = require(path.resolve('helper', 'model', 'form'))
exports.FormPublishedModel = require(path.resolve(
  'helper',
  'model',
  'formpublished'
))
exports.formPermission = require(path.resolve(
  'helper',
  'model',
  'formPermission'
))
exports.user = require(path.resolve('helper', 'model', 'user'))
exports.oauth = require(path.resolve('helper', 'model', 'oauth'))
