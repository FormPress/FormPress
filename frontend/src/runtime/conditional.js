;(() => {
  // this dependency script is for conditional logic
  const operatorFunctions = {
    equals: (value1, value2) => value1 === value2,
    notEquals: (value1, value2) => value1 !== value2,
    contains: (value1, value2) => value1.includes(value2),
    notContains: (value1, value2) => !value1.includes(value2),
    startsWith: (value1, value2) => value1.startsWith(value2),
    notStartsWith: (value1, value2) => !value1.startsWith(value2),
    endsWith: (value1, value2) => value1.endsWith(value2),
    notEndsWith: (value1, value2) => !value1.endsWith(value2),
    isEmpty: (value) => value.trim().length === 0,
    isFilled: (value) => value.trim().length > 0
  }

  const commandFunctions = {
    show: (elementContainer) => elementContainer.classList.remove('dn'),
    hide: (elementContainer) => elementContainer.classList.add('dn')
  }

  const commandNegatives = {
    show: 'hide',
    hide: 'show'
  }

  const rules = window.FORMPRESS.rules

  for (const rule of rules) {
    const { if: ifRule, then: thenRule } = rule
    const { field: ifField, operator, value: expectedValue } = ifRule
    const { command, field: thenField, value: thenValue } = thenRule

    // continue if any of these are not found
    if (!ifField || !operator || !expectedValue || !command || !thenField) {
      continue
    }

    const foundIfElem = FORMPRESS.elements.find((elem) => {
      return elem.id === parseInt(ifRule.field)
    })

    const foundThenElem = FORMPRESS.elements.find((elem) => {
      return elem.id === parseInt(thenRule.field)
    })

    if (foundIfElem === undefined || foundThenElem === undefined) {
      continue
    }

    const ifFieldElementContainer = document.getElementById(
      `qc_${ifRule.field}`
    )
    const thenFieldElementContainer = document.getElementById(
      `qc_${thenRule.field}`
    )

    let ifFieldValueGetter =
      FP_ELEMENT_HELPERS[foundIfElem.type].getElementValue

    let expectedValueGetter = () => {
      return expectedValue
    }

    const elemsThatHasArrayValue = ['Checkbox', 'Radio', 'Address', 'Name']

    if (elemsThatHasArrayValue.includes(foundIfElem.type)) {
      ifFieldValueGetter = () => {
        const array = FP_ELEMENT_HELPERS[foundIfElem.type]
          .getElementValue(ifRule.field)
          .filter(
            (node) =>
              node.value !== '' &&
              (node.checked === true || node.checked === undefined)
            // but not false
          )
          .map((node) => node.value)

        const plainString = array.join(' ')

        return plainString
      }
    }

    const elemsThatRequireEventListener = [ifFieldElementContainer]

    let refElemContainer = null

    if (rule.fieldLink === true) {
      // this means expectedValue points to another element
      const refElemID = ifRule.value

      const foundRefElem = FORMPRESS.elements.find((elem) => {
        return elem.id === parseInt(refElemID)
      })

      if (foundRefElem === undefined) {
        continue
      }

      refElemContainer = document.getElementById(`qc_${refElemID}`)

      if (refElemContainer !== null && refElemContainer !== undefined) {
        elemsThatRequireEventListener.push(refElemContainer)
      }

      expectedValueGetter = () => {
        return FP_ELEMENT_HELPERS[foundRefElem.type].getElementValue(refElemID)
      }
    }

    const listener = (e) => {
      let ifFieldValue = ifFieldValueGetter(ifRule.field)
      let expectedValue = expectedValueGetter()

      const operatorFunction = operatorFunctions[operator]
      const executeCommand = commandFunctions[command]
      const revertCommand = commandFunctions[commandNegatives[command]]

      if (!ifFieldValue || !expectedValue) {
        return revertCommand(thenFieldElementContainer)
      }

      const assessment = operatorFunction(
        ifFieldValue.toLowerCase(),
        expectedValue.toLowerCase()
      )

      try {
        if (assessment === true) {
          executeCommand(thenFieldElementContainer)
        } else {
          revertCommand(thenFieldElementContainer)
        }
      } catch (e) {
        console.error(e)
      }
    }

    // apply the listener for the first time to set the initial state
    listener()

    elemsThatRequireEventListener.forEach((elem) => {
      elem.addEventListener('input', listener)
    })
  }
})()
