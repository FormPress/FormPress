const template = require.context('.', false, /\.json$/)
const templates = []

template.keys().forEach((fileName) => {
  fileName.replace(/(\.\/|\.json)/g, '')
  templates.push(template(fileName))
})

export default templates
