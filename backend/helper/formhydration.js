const encodeCustomCSS = (form) => {
  if (form.props.customCSS !== undefined) {
    const decodedCSS = form.props.customCSS.value
    const buff = Buffer.from(decodedCSS, 'utf8')
    const encodedCSS = buff.toString('base64')

    form.props.customCSS.value = encodedCSS
    form.props.customCSS.isEncoded = true
  }
}

const decodeCustomCSS = (form) => {
  if (form.props.customCSS !== undefined) {
    const encodedCSS = form.props.customCSS.value
    const buff = Buffer.from(encodedCSS, 'base64')
    const decodedCSS = buff.toString('utf8')

    form.props.customCSS.value = decodedCSS
    form.props.customCSS.isEncoded = false
  }
}

exports.hydrateForm = (form) => {
  form.props = JSON.parse(form.props)
  decodeCustomCSS(form)

  return form
}

exports.dehydrateForm = (form) => {
  encodeCustomCSS(form)
  form.props = JSON.stringify(form.props)

  return form
}
