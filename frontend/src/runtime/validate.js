;(async () => {
  const valids = {}
  let formHasRequiredField = false

  for (const elem of FORMPRESS.elements) {
    if (elem.required === true) {
      formHasRequiredField = true
    }
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

    const domElem = document.getElementById(`q_${id}`)
    const containerElem = document.getElementById(`qc_${id}`)

    domElem.addEventListener('blur', () => {
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

    domElem.addEventListener('keyup', () => {
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
      event.preventDefault()

      for (const elem of errorsToTrigger) {
        document.getElementById(`qc_${elem}`).classList.add('invalidError')
      }

      return false
    } else {
      if (!formHasRequiredField) {
        form.submit()
      }
    }
  })
})()
