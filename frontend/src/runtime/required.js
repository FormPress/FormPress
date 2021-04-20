;(async () => {
  console.log('REQUIRED LOADED')
  const requireds = {}

  for (const elem of FORMPRESS.elements) {
    if (elem.required !== true) {
      continue
    }

    const id = elem.id
    let elemActivated = false
    const domElem = document.getElementById(`q_${id}`)
    const containerElem = document.getElementById(`qc_${id}`)

    if (elem.type === 'Checkbox' || elem.type === 'Radio') {
      const domNames = document.getElementsByName(`q_${id}`)

      requireds[id] = {
        id,
        valid: false
      }

      domNames.forEach((domName) => {
        domName.addEventListener('blur', () => {
          if (domName.checked) {
            containerElem.classList.remove('requiredError')
            requireds[id].valid = true
          } else {
            let checkedInputLength = 0
            domNames.forEach((domName) => {
              if (domName.checked == true) {
                checkedInputLength++
              }
            })
            if (checkedInputLength == 0) {
              containerElem.classList.add('requiredError')
              requireds[id].valid = false
            }
          }
        })

        domName.addEventListener('change', function () {
          if (domName.checked) {
            containerElem.classList.remove('requiredError')
            requireds[id].valid = true
          } else {
            let checkedInputLength = 0
            domNames.forEach((domName) => {
              if (domName.checked == true) {
                checkedInputLength++
              }
            })
            if (checkedInputLength == 0) {
              containerElem.classList.add('requiredError')
              requireds[id].valid = false
            }
          }
        })
      })
    } else if (elem.type === 'Dropdown') {
      requireds[id] = {
        id,
        valid: domElem.value.trim() !== 'choose-disabled'
      }

      domElem.addEventListener('blur', () => {
        const value = domElem.value

        if (value.trim() !== 'Choose one') {
          containerElem.classList.remove('requiredError')
          requireds[id].valid = true
        } else {
          containerElem.classList.add('requiredError')
          requireds[id].valid = false
        }
      })
      domElem.addEventListener('change', function () {
        if (this.value === 'Choose one') {
          containerElem.classList.add('requiredError')
          requireds[id].valid = false
        } else {
          containerElem.classList.remove('requiredError')
          requireds[id].valid = true
        }
      })
    } else if (elem.type === 'Name') {
      const domElem1 = containerElem.querySelector(`#fname`)
      const domElem2 = containerElem.querySelector(`#lname`)
      requireds[id] = {
        id,
        valid: !(
          domElem1.value.trim().length === 0 ||
          domElem2.value.trim().length === 0
        )
      }

      domElem1.addEventListener('blur', () => {
        let value1 = domElem1.value
        let value2 = domElem2.value
        if (value1.trim().length > 0 && value2.trim().length > 0) {
          containerElem.classList.remove('requiredError')
          requireds[id].valid = true
        } else {
          containerElem.classList.add('requiredError')
          requireds[id].valid = false
        }
      })

      domElem2.addEventListener('blur', () => {
        let value1 = domElem1.value
        let value2 = domElem2.value
        if (value1.trim().length > 0 && value2.trim().length > 0) {
          containerElem.classList.remove('requiredError')
          requireds[id].valid = true
        } else {
          containerElem.classList.add('requiredError')
          requireds[id].valid = false
        }
      })

      domElem1.addEventListener('keyup', () => {
        let value1 = domElem1.value
        let value2 = domElem2.value
        if (value1.trim().length > 0 && value2.trim().length > 0) {
          containerElem.classList.remove('requiredError')
          requireds[id].valid = true
        } else {
          containerElem.classList.add('requiredError')
          requireds[id].valid = false
        }
      })

      domElem2.addEventListener('keyup', () => {
        let value1 = domElem1.value
        let value2 = domElem2.value
        if (value1.trim().length > 0 && value2.trim().length > 0) {
          containerElem.classList.remove('requiredError')
          requireds[id].valid = true
        } else {
          containerElem.classList.add('requiredError')
          requireds[id].valid = false
        }
      })

      domElem1.addEventListener('focus', () => {
        elemActivated = true
      })

      domElem2.addEventListener('focus', () => {
        elemActivated = true
      })
    } else if (elem.type === 'FileUpload') {
      requireds[id] = {
        id,
        valid: domElem.value.trim().length > 0
      }

      domElem.addEventListener('blur', () => {
        const value = domElem.value

        if (domElem.value.trim().length === 0) {
          containerElem.classList.add('requiredError')
          requireds[id].valid = false
        } else {
          containerElem.classList.remove('requiredError')
          requireds[id].valid = true
        }
      })
      domElem.addEventListener('change', function () {
        if (domElem.value.trim().length === 0) {
          containerElem.classList.add('requiredError')
          requireds[id].valid = false
        } else {
          containerElem.classList.remove('requiredError')
          requireds[id].valid = true
        }
      })
    } else {
      requireds[id] = {
        id,
        valid: domElem.value.trim().length > 0
      }

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

    if (
      elem.type !== 'Name' &&
      elem.type !== 'Checkbox' &&
      elem.type !== 'Radio'
    ) {
      domElem.addEventListener('focus', () => {
        elemActivated = true
      })
    }
  }

  const form = document.getElementById(`FORMPRESS_FORM_${FORMPRESS.formId}`)
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    console.log('submit on going')
    console.log(requireds)
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
    } else {
      form.submit()
    }
  })
})()
