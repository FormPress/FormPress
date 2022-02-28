// detects the environment, acts as a polyfill for webpack's require.context
if (typeof require.context === 'undefined') {
  const fs = require('fs')
  const path = require('path')

  require.context = (
    base = '.',
    scanSubDirectories = false,
    regularExpression = /\.json$/
  ) => {
    const files = {}

    function readDirectory(directory) {
      fs.readdirSync(directory).forEach((file) => {
        const fullPath = path.resolve(directory, file)

        if (fs.statSync(fullPath).isDirectory()) {
          if (scanSubDirectories) readDirectory(fullPath)

          return
        }

        if (!regularExpression.test(fullPath)) return

        files[fullPath] = true
      })
    }

    readDirectory(path.resolve(__dirname, base))

    function Module(file) {
      return require(file)
    }

    Module.keys = () => Object.keys(files)

    return Module
  }
}

const template = require.context('.', false, /\.json$/)
const templates = []

template.keys().forEach((fileName) => {
  fileName.replace(/(\.\/|\.json)/g, '')
  templates.push(template(fileName))
})

export default templates
