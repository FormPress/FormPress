const path = require('path')
const sass = require('sass')
const fs = require('fs')

const sassCompile = () => {
  const srcDir = path.resolve('../', 'frontend/src/style/themes/scss')
  const outputDir = path.resolve('../', 'frontend/src/style/themes')

  const files = fs.readdirSync(srcDir)

  files.forEach((file) => {
    const filePath = path.join(srcDir, file)
    if (path.extname(file) === '.scss') {
      sass.render(
        {
          file: filePath
        },
        (err, result) => {
          if (err) {
            console.error(err)
            return
          }
          const cssPath = path.join(outputDir, file.replace('.scss', '.css'))
          fs.writeFileSync(cssPath, result.css)
        }
      )
    }
  })
}

module.exports = sassCompile
