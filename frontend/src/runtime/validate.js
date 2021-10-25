;(async () => {
  console.log('VALIDATE LOADED')
  const valids = {}

  for (const elem of FORMPRESS.elements) {
    const id = elem.id
    let elemActivated = false
    const domElem = document.getElementById(`q_${id}`)
    const containerElem = document.getElementById(`qc_${id}`)

    if (elem.type === 'Email') {
      valids[id] = {
        id,
        valid: domElem.value.trim().length > 0
      }

      domElem.addEventListener('blur', () => {
        const value = domElem.value
        if (domElem.value.trim().length > 0) {
          valids[id].valid =
            domElem.value.length > 2 && domElem.value.indexOf('@') > -1
          domElem.value.length > 2 && domElem.value.indexOf('@') > -1 === true
            ? containerElem.classList.remove('requiredError')
            : containerElem.classList.add('requiredError')
        } else {
          containerElem.classList.remove('requiredError')
          valids[id].valid = true
        }
      })

      domElem.addEventListener('keyup', () => {
        const value = domElem.value
        if (domElem.value.trim().length > 0) {
          valids[id].valid = pattern.test(domElem.value.trim())
        } else {
          containerElem.classList.remove('requiredError')
          valids[id].valid = true
        }
      })
    }
  }

  const form = document.getElementById(`FORMPRESS_FORM_${FORMPRESS.formId}`)
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    console.log('submit on going')
    console.log(valids)
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
    console.log('errorsToTrigger ', errorsToTrigger)
    if (allValid === false) {
      console.log('not all valid should stop submission')
      event.preventDefault()

      for (const elem of errorsToTrigger) {
        document.getElementById(`qc_${elem}`).classList.add('requiredError')
      }

      return false
    } else {
      form.submit()
    }
  })
})()
