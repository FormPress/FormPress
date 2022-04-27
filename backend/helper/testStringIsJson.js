exports.hasJsonStructure = (string) => {
  if (typeof string !== 'string') return false
  try {
    const result = JSON.parse(string)
    const type = Object.prototype.toString.call(result)
    return type === '[object Object]' || type === '[object Array]'
  } catch (err) {
    return false
  }
}

exports.safeJsonParse = (string) => {
  try {
    return JSON.parse(string)
  } catch (err) {
    return [err]
  }
}
