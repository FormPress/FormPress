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

  app.get(
    '/api/app/get/backendPluginFiles',
    mustHaveValidToken,
    async (req, res) => {
      fs.readdirSync('middleware/plugins', { withFileTypes: true }).forEach(
        function (file) {
          if (file.name.indexOf('.plugin.js') > 0) {
            require(path.resolve('middleware/plugins', `${file.name}`))(app)
          }
        }
      )
      res.status(200).json('{"status":"dummy"}')
    }
  )
}
