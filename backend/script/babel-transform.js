require('ignore-styles')
const babel = require('@babel/core')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const options = {
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-modules-commonjs'
  ],
  presets: ['@babel/preset-react']
}
const frontendRuntimeTarget = path.resolve(
  '../',
  'frontend',
  process.env.FP_ENV === 'production' ? 'build' : 'public',
  'runtime'
)
const frontend3rdpartyTarget = path.resolve(frontendRuntimeTarget, '3rdparty')

const transformCached = (input, filename) => {
  const shasum = crypto.createHash('sha1')
  shasum.update(input)
  const sha1 = shasum.digest('hex')
  const checkFile = path.resolve(
    './',
    'script',
    'transformed',
    '__cache__',
    sha1
  )

  if (fs.existsSync(checkFile) === true) {
    console.log(`Returning file(${filename}) from cache`)
    return fs.readFileSync(checkFile)
  } else {
    const out = babel.transformSync(input, options)
    fs.writeFileSync(checkFile, out.code)

    return out.code
  }
}

const createDirs = [
  path.resolve(path.resolve('./', 'script', 'transformed')),
  path.resolve(path.resolve('./', 'script', 'transformed', '__cache__')),
  path.resolve(path.resolve('./', 'script', 'transformed', 'modules')),
  path.resolve(path.resolve('./', 'script', 'transformed', 'common')),
  frontendRuntimeTarget,
  frontend3rdpartyTarget
]

for (const dir of createDirs) {
  if (fs.existsSync(dir) === false) {
    fs.mkdirSync(dir)
  }
}

const transformMap = [
  {
    type: 'folder',
    extension: '.js',
    source: path.resolve('../', 'frontend', 'src', 'runtime'),
    target: frontendRuntimeTarget
  },
  {
    type: 'folder',
    extension: '.js',
    source: path.resolve('../', 'frontend', 'src', 'datasets'),
    target: path.resolve('./', 'script', 'transformed', 'datasets')
  },
  {
    type: 'folder_copy',
    extension: '.json',
    source: path.resolve('../', 'frontend', 'src', 'datasets'),
    target: path.resolve('./', 'script', 'transformed', 'datasets')
  },
  {
    type: 'folder_copy',
    extension: '.js',
    source: path.resolve('../', 'frontend', 'src', 'runtime', '3rdparty'),
    target: frontend3rdpartyTarget
  },
  {
    type: 'file',
    source: path.resolve('../', 'frontend', 'src', 'modules', 'Renderer.js'),
    target: path.resolve('./', 'script', 'transformed', 'Renderer.js')
  },
  {
    type: 'file',
    source: path.resolve(
      '../',
      'frontend',
      'src',
      'modules',
      'optimization.js'
    ),
    target: path.resolve('./', 'script', 'transformed', 'optimization.js')
  },
  {
    type: 'file',
    source: path.resolve(
      '../',
      'frontend',
      'src',
      'modules',
      'ConfigurableSettings.js'
    ),
    target: path.resolve(
      './',
      'script',
      'transformed',
      'modules',
      'ConfigurableSettings.js'
    )
  },
  {
    type: 'file',
    source: path.resolve(
      '../',
      'frontend',
      'src',
      'modules/common',
      'EditableLabel.js'
    ),
    target: path.resolve(
      './',
      'script',
      'transformed/common',
      'EditableLabel.js'
    )
  },
  {
    type: 'file',
    source: path.resolve(
      '../',
      'frontend',
      'src',
      'modules/common',
      'EditableList.js'
    ),
    target: path.resolve(
      './',
      'script',
      'transformed/common',
      'EditableList.js'
    )
  },
  {
    type: 'file',
    source: path.resolve(
      '../',
      'frontend',
      'src',
      'modules/common',
      'ElementContainer.js'
    ),
    target: path.resolve(
      './',
      'script',
      'transformed/common',
      'ElementContainer.js'
    )
  },
  {
    type: 'folder',
    extension: '.js',
    source: path.resolve('../', 'frontend', 'src', 'modules', 'elements'),
    target: path.resolve('./', 'script', 'transformed', 'elements')
  },
  {
    type: 'folder',
    extension: '.css',
    source: path.resolve('../', 'frontend', 'src', 'modules', 'common'),
    target: path.resolve('./', 'script', 'transformed', 'common')
  },
  {
    type: 'folder',
    extension: '.css',
    source: path.resolve('../', 'frontend', 'src', 'modules', 'elements'),
    target: path.resolve('./', 'script', 'transformed', 'elements')
  },
  {
    type: 'folder',
    extension: '.js',
    source: path.resolve('../', 'frontend', 'src', 'modules', 'internal'),
    target: path.resolve('./', 'script', 'transformed', 'internal')
  },
  {
    type: 'folder',
    extension: '.css',
    source: path.resolve('../', 'frontend', 'src', 'modules', 'internal'),
    target: path.resolve('./', 'script', 'transformed', 'internal')
  }
]

const transformFrontend = () => {
  const ping = new Date().getTime()

  for (const transform of transformMap) {
    const { type, source, target } = transform
    let input, result, files

    switch (type) {
      case 'file':
        input = fs.readFileSync(source)
        console.log(`Transpiling ${source}`)
        //result = babel.transformSync(input, options)
        result = transformCached(input, source)
        fs.writeFileSync(target, result)
        break
      case 'folder':
        //create target folder if does not exists
        if (fs.existsSync(target) === false) {
          fs.mkdirSync(target)
        }

        files = fs
          .readdirSync(source)
          .filter((fileName) => fileName.endsWith(transform.extension))

        for (const file of files) {
          console.log(`Transpiling ${path.resolve(source, file)}`)

          if (file.endsWith('.css')) {
            fs.writeFileSync(path.resolve(target, file), '')
          } else {
            const input = fs.readFileSync(path.resolve(source, file))
            const result = transformCached(input, file)
            fs.writeFileSync(path.resolve(target, file), result)
          }
        }
        break
      case 'folder_copy':
        //create target folder if does not exists
        if (fs.existsSync(target) === false) {
          fs.mkdirSync(target)
        }

        files = fs
          .readdirSync(source)
          .filter((fileName) => fileName.endsWith(transform.extension))

        for (const file of files) {
          console.log(`Transpiling ${path.resolve(source, file)}`)

          if (file.endsWith('.css')) {
            fs.writeFileSync(path.resolve(target, file), '')
          } else {
            const input = fs.readFileSync(path.resolve(source, file))

            fs.writeFileSync(path.resolve(target, file), input)
          }
        }
        break
    }
  }

  console.log(
    `Transforming files took ${(new Date().getTime() - ping) / 1000} seconds`
  )
}

module.exports = transformFrontend
