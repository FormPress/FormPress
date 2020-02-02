(async () => {
  console.log('REQUIRED LOADED')
  const requireds = {}

  for (const elem of FORMPRESS.elements) {
    if (elem.required !== true) {
      continue
    }

    console.log('Handle required check for element ', elem)


    const id = elem.id
    let elemActivated = false
    const domElem = document.getElementById(`q_${id}`)
    const containerElem = document.getElementById(`qc_${id}`)

    requireds[id] = {
      id,
      valid: (domElem.value.trim().length > 0)
    }

    

    console.log('DOM ELEM ', domElem)
    domElem.addEventListener('focus', () => {
      elemActivated = true
    })

    domElem.addEventListener('blur', () => {
      const value = domElem.value

      if (value.trim().length === 0) {
        containerElem.classList.add('requiredError')
        requireds[id].valid = false
      } else {
        containerElem.classList.remove('requiredError')
        requireds[id].valid = true
      }
    })

    domElem.addEventListener('keyup', () => {
      const value = domElem.value
      console.log('OnChange oldi', value)
      if (value.trim().length === 0) {
        containerElem.classList.add('requiredError')
        requireds[id].valid = false
      } else {
        containerElem.classList.remove('requiredError')
        requireds[id].valid = true
      }
    })
  }

  const form = document.getElementById(`FORMPRESS_FORM_${FORMPRESS.formId}`)

  form.addEventListener('submit', (event) => {
    console.log('submit on going')
    const keys = Object.keys(requireds)
    let allValid = true
    const errorsToTrigger = []

    for (const key of keys) {
      const elem = requireds[key]

      if (elem.valid === false) {
        allValid = false
        errorsToTrigger.push(elem.id)
      }
    }
    console.log('errorsToTrigger ', errorsToTrigger)
    if (allValid === false) {
      console.log('not all valid should stop submission')
      event.preventDefault()

      for (const elem of errorsToTrigger) {
        document.getElementById(`qc_${elem}`).classList.add('requiredError')
      }

      return false
    }
  })

})()
