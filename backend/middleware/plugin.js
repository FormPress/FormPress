const path = require('path')
const frontendPath = '/frontend/'
const fs = require('fs')

const { mustHaveValidToken } = require(path.resolve(
  'middleware',
  'authorization'
))

module.exports = (app) => {
  app.get(
    '/api/app/get/settingsPluginfileslist',
    mustHaveValidToken,
    async (req, res) => {
      fs.readdir(frontendPath + 'src/modules/settings', (err, files) => {
        res.json(files.filter((file) => file.endsWith('.js')))
      })
    }
  )
}
