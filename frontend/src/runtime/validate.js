;(async () => {
  const valids = {}

  const additionalElemEventListeners = {
    Email: ['input']
  }

  for (const elem of FORMPRESS.elements) {
    const id = elem.id
    const elemHelpers = FP_ELEMENT_HELPERS[elem.type]

    if (elemHelpers.isValid === undefined) {
      continue
    }

    valids[id] = {
      id,
      valid: true
    }

    const containerElem = document.getElementById(`qc_${id}`)

    containerElem.addEventListener('change', () => {
      let value = elemHelpers.getElementValue(id)
      valids[id].valid = elemHelpers.isValid(value)

      if (elemHelpers.isFilled(value)) {
        valids[id].valid === true
          ? containerElem.classList.remove('invalidError')
          : containerElem.classList.add('invalidError')
      } else {
        containerElem.classList.remove('invalidError')
        valids[id].valid = true
      }
    })

    if (additionalElemEventListeners[elem.type]) {
      additionalElemEventListeners[elem.type].forEach((eventListener) => {
        containerElem.addEventListener(eventListener, () => {
          let value = elemHelpers.getElementValue(id)
          valids[id].valid = elemHelpers.isValid(value)

          if (elemHelpers.isFilled(value)) {
            valids[id].valid === true
              ? containerElem.classList.remove('invalidError')
              : containerElem.classList.add('invalidError')
          } else {
            containerElem.classList.remove('invalidError')
            valids[id].valid = true
          }
        })
      })
    }
  }

  const form = document.getElementById(`FORMPRESS_FORM_${FORMPRESS.formId}`)
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const keys = Object.keys(valids)
    let allValid = true
    const errorsToTrigger = []

    for (const key of keys) {
      const elem = valids[key]

      if (elem.valid === false) {
        allValid = false
        errorsToTrigger.push(elem.id)
      }
    }

    if (allValid === false) {
      FORMPRESS.validateGoodToGo = false

      for (const elem of errorsToTrigger) {
        document.getElementById(`qc_${elem}`).classList.add('invalidError')
      }

      const firstRequiredError = document.querySelector(`.requiredError`)
      const firstInvalidError = document.querySelector(`.invalidError`)

      if (firstInvalidError) {
        // required errors have the priority
        if (!firstRequiredError) {
          firstInvalidError.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      }
    } else {
      FORMPRESS.validateGoodToGo = true
    }
  })
})()
