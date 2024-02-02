const encodeCustomCSS = (customCSS) => {
  if (customCSS !== undefined) {
    const decodedCSS = customCSS.value
    const buff = Buffer.from(decodedCSS, 'utf8')
    const encodedCSS = buff.toString('base64')

    return {
      value: encodedCSS,
      isEncoded: true
    }
  }
}

const decodeCustomCSS = (customCSS) => {
  if (customCSS !== undefined) {
    const encodedCSS = customCSS.value
    const buff = Buffer.from(encodedCSS, 'base64')
    const decodedCSS = buff.toString('utf8')

    return {
      value: decodedCSS,
      isEncoded: false
    }
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

  form.props = JSON.stringify(form.props)

  return form
}
