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

    const fpElement = FORMPRESS.elements.find((element) => {
      return element.id === parseInt(questionID)
    })

    const questionValue = value

    if (fpElement === undefined) {
      return
    }

    const fpElementType = fpElement.type

    switch (fpElementType) {
      case 'TextBox':
      case 'TextArea':
      case 'Email':
      case 'Phone': {
        const htmlElement = document.getElementsByName(questionName)[0]
        htmlElement.value = questionValue

        const event = new Event('change')

        const htmlElementContainer = document.getElementById(`qc_${questionID}`)

        htmlElementContainer.dispatchEvent(event)
        break
      }
      default:
        break
    }
  })
})()
