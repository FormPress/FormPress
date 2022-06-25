;(async () => {
  FORMPRESS.requireds = {}

  const additionalElemEventListeners = {
    Email: ['input'],
    Name: ['input'],
    TextArea: ['input'],
    TextBox: ['input'],
    Address: ['input'],
    Phone: ['input']
  }

  for (const elem of FORMPRESS.elements) {
    if (elem.required !== true) {
      continue
    }

    const elemHelpers = FP_ELEMENT_HELPERS[elem.type]

    if (elemHelpers.isFilled === undefined) {
      continue
    }

    const id = elem.id
    const containerElem = document.getElementById(`qc_${id}`)
    const elementPageNumber = containerElem.parentElement.dataset.fpPagenumber
    let value = elemHelpers.getElementValue(id)

    FORMPRESS.requireds[id] = {
      id,
      valid: elemHelpers.isFilled(value),
      page: elementPageNumber
    }

    containerElem.addEventListener('change', () => {
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
    })

    if (additionalElemEventListeners[elem.type]) {
      additionalElemEventListeners[elem.type].forEach((eventListener) => {
        containerElem.addEventListener(eventListener, () => {
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
        })
      })
    }
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
