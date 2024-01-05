;(async () => {
  const params = new URLSearchParams(window.location.search)

  if (!params) {
    return
  }

  const prepopulateParams = Array.from(params.entries()).filter(([key]) => {
    return key.startsWith('q_')
  })

  if (prepopulateParams.length === 0) {
    return
  }

  prepopulateParams.forEach(([key, value]) => {
    const questionName = key
    const questionID = key.split('_')[1]

    let hasCustomFieldId = false

    if (isNaN(questionID)) {
      hasCustomFieldId = true
    }

    let fpElement

    if (hasCustomFieldId) {
      fpElement = FORMPRESS.elements.find((element) => {
        return element.customFieldId === questionID
      })
    } else {
      fpElement = FORMPRESS.elements.find((element) => {
        return element.id === parseInt(questionID)
      })
    }

    if (fpElement === undefined) {
      return
    }

    const questionValue = value

    const fpElementType = fpElement.type

    switch (fpElementType) {
      case 'TextBox':
      case 'TextArea':
      case 'Email':
      case 'Phone': {
        try {
          let htmlElement, htmlElementContainer

          if (hasCustomFieldId) {
            htmlElement = document.querySelector(
              `[data-fp-custom-field-id="q_${questionID}"]`
            )
            htmlElementContainer = document.querySelector(
              `[data-fp-custom-field-id="qc_${questionID}"]`
            )
          } else {
            htmlElement = document.getElementsByName(questionName)[0]
            htmlElementContainer = document.getElementById(`qc_${questionID}`)
          }

          htmlElement.value = questionValue
          htmlElementContainer.dispatchEvent(new Event('change'))
        } catch (e) {
          console.log('Error prepopulating. Duplicate question id?')
        }
        break
      }
      default:
        break
    }
  })
})()
