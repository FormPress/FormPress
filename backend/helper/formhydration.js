const encodeCustomCSS = (customCSS) => {
  if (customCSS !== undefined) {
    const decodedCSS = customCSS.value
    const buff = Buffer.from(decodedCSS, 'utf8')
    const encodedCSS = buff.toString('base64')

    const customCSS = {
      value: encodedCSS,
      isEncoded: true
    }

    return customCSS
  }
}

const decodeCustomCSS = (customCSS) => {
  if (customCSS !== undefined) {
    const encodedCSS = customCSS.value
    const buff = Buffer.from(encodedCSS, 'base64')
    const decodedCSS = buff.toString('utf8')

    const customCSS = {
      value: decodedCSS,
      isEncoded: false
    }

    return customCSS
  }
}

exports.hydrateForm = (form, shouldSanitize) => {
  form.props = JSON.parse(form.props)
  form.props.customCSS = decodeCustomCSS(form.props.customCSS)

  if (shouldSanitize === true) {
    form.props.integrations = form.props.integrations.map(
      (i) => `${i.type} integration`
    )
  }

  return form
}

exports.dehydrateForm = (form) => {
  form.props.customCSS = encodeCustomCSS(form.props.customCSS)

  form.props.integrations.forEach((i) => {
    if (typeof i === 'string') {
      throw new Error('Integration is not an object')
    }
  })

  form.props = JSON.stringify(form.props)

  return form
}
