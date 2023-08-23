;(async () => {
  if (FORMPRESS.requireds === undefined) {
    FORMPRESS.requireds = {}
  }

  const additionalElemEventListeners = {
    Email: ['input'],
    Name: ['input'],
    TextArea: ['input'],
    TextBox: ['input'],
    Address: ['input'],
    Phone: ['input'],
    DatePicker: ['input'],
    Location: ['input']
  }

  function requiredCheck(id) {
    const containerElem = document.getElementById(`qc_${id}`)
    const elem = FORMPRESS.elements.find((elem) => {
      return elem.id === parseInt(id)
    })
    const elemHelpers = window.FP_ELEMENT_HELPERS[elem.type]

    let value = elemHelpers.getElementValue(id)
    FORMPRESS.requireds[id].valid = elemHelpers.isFilled(value)
    let isFilled = elemHelpers.isFilled(value)

    if (isFilled) {
      FORMPRESS.requireds[id].valid = true
      containerElem.classList.remove('requiredError')
    } else {
      containerElem.classList.add('requiredError')
      FORMPRESS.requireds[id].valid = false
    }
  }

  function setRequired(id) {
    const containerElem = document.getElementById(`qc_${id}`)
    const elem = FORMPRESS.elements.find((elem) => {
      return elem.id === parseInt(id)
    })
    const elemHelpers = FP_ELEMENT_HELPERS[elem.type]

    const elementPageNumber = containerElem.parentElement.dataset.fpPagenumber
    let value = elemHelpers.getElementValue(id)

    FORMPRESS.requireds[id] = {
      id,
      valid: elemHelpers.isFilled(value),
      page: elementPageNumber
    }

    const labelElem = containerElem.querySelector(`#label_${id}`)
    if (labelElem) {
      labelElem.classList.add('required')
    }

    containerElem.addEventListener('change', () => requiredCheck(id))

    if (additionalElemEventListeners[elem.type]) {
      additionalElemEventListeners[elem.type].forEach((eventListener) => {
        containerElem.addEventListener(eventListener, () => requiredCheck(id))
      })
    }
  }

  function setNotRequired(id) {
    const containerElem = document.getElementById(`qc_${id}`)
    const elem = FORMPRESS.elements.find((elem) => {
      return elem.id === parseInt(id)
    })

    delete FORMPRESS.requireds[id]
    containerElem.classList.remove('requiredError')

    const labelElem = containerElem.querySelector(`#label_${id}`)
    if (labelElem) {
      labelElem.classList.remove('required')
    }

    containerElem.removeEventListener('change', () => requiredCheck(id))
    if (additionalElemEventListeners[elem.type]) {
      additionalElemEventListeners[elem.type].forEach((eventListener) => {
        containerElem.removeEventListener(eventListener, () =>
          requiredCheck(id)
        )
      })
    }
  }

  for (const elem of FORMPRESS.elements) {
    if (elem.required !== true) {
      continue
    }
    const elemHelpers = FP_ELEMENT_HELPERS[elem.type]

    if (elemHelpers.isFilled === undefined) {
      continue
    }

    setRequired(elem.id)
  }

  window.FORMPRESS.requiredApi = {
    setRequired,
    setNotRequired
  }

  const form = document.getElementById(`FORMPRESS_FORM_${FORMPRESS.formId}`)
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const keys = Object.keys(FORMPRESS.requireds)
    let allValid = true
    const errorsToTrigger = []

    for (const key of keys) {
      const elem = FORMPRESS.requireds[key]

      if (elem.valid === false) {
        allValid = false
        errorsToTrigger.push(elem.id)
      }
    }

    if (allValid === false) {
      FORMPRESS.requiredGoodToGo = false

      for (const elem of errorsToTrigger) {
        document.getElementById(`qc_${elem}`).classList.add('requiredError')
      }

      const firstRequiredError = document.querySelector(`.requiredError`)

      if (firstRequiredError) {
        firstRequiredError.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    } else {
      FORMPRESS.requiredGoodToGo = true
    }
  })
})()
