;(() => {
  if (FORMPRESS.requireds === undefined) {
    FORMPRESS.requireds = {}
  }

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
    isFilled: (value) => value.trim().length > 0,
    isEarlierThan: (value1, value2) => {
      const date1 = new Date(value1)
      const date2 = new Date(value2)

      return date1 < date2
    },
    isLaterThan: (value1, value2) => {
      const date1 = new Date(value1)
      const date2 = new Date(value2)

      return date1 > date2
    }
  }

  const ruleTypeSpecificInitializers = {
    changeTyPage: (rule) => {
      // create a hidden input with a default value of null
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = `fp_rule_changeTyPage`
      input.id = `fp_rule_changeTyPage_${rule.id}`

      input.value = ''
      document.querySelector('form').appendChild(input)
      return input
    }
  }

  const commandFunctions = {
    show: (elementContainer) => elementContainer.classList.remove('dn'),
    hide: (elementContainer) => elementContainer.classList.add('dn'),
    displaySelectedPage: (hiddenInput, rule) => {
      const { then } = rule
      const { field, value } = then

      hiddenInput.value = field
    },
    unsetSelectedPage: (hiddenInput) => {
      hiddenInput.value = ''
    },
    setRequired: (elementContainer) => {
      const id = elementContainer.id.split('_')[1]
      try {
        FORMPRESS.requiredApi.setRequired(id)
      } catch (e) {
        console.log(e)
      }
    },
    setNotRequired: (elementContainer) => {
      const id = elementContainer.id.split('_')[1]
      try {
        FORMPRESS.requiredApi.setNotRequired(id)
      } catch (e) {
        console.log(e)
      }
    }
  }

  const commandNegatives = {
    show: 'hide',
    hide: 'show',
    displaySelectedPage: 'unsetSelectedPage',
    unsetSelectedPage: 'displaySelectedPage',
    setRequired: 'setNotRequired',
    setNotRequired: 'setRequired'
  }

  const rules = window.FORMPRESS.rules

  for (const rule of rules) {
    let { if: ifRule, then: thenRule } = rule
    let { field: ifField, operator, value: expectedValue } = ifRule
    let { command, field: thenField, value: thenValue } = thenRule

    // continue if any of these are not found
    if (!ifField || !operator || !expectedValue || !command || !thenField) {
      continue
    }

    const foundIfElem = FORMPRESS.elements.find((elem) => {
      return elem.id === parseInt(ifRule.field)
    })

    if (foundIfElem === undefined) {
      continue
    }

    const ifFieldElementContainer = document.getElementById(
      `qc_${ifRule.field}`
    )

    let thenFieldElementContainer

    if (rule.type === 'changeTyPage') {
      const initialInput = ruleTypeSpecificInitializers.changeTyPage(rule)
      thenFieldElementContainer = initialInput
    } else {
      thenFieldElementContainer = document.getElementById(
        `qc_${thenRule.field}`
      )
    }

    let ifFieldValueGetter =
      FP_ELEMENT_HELPERS[foundIfElem.type].getElementValue

    let expectedValueGetter = () => {
      return expectedValue
    }

    const elemsThatHasArrayValue = [
      'Checkbox',
      'Radio',
      'Address',
      'Name',
      'DatePicker'
    ]

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
          executeCommand(thenFieldElementContainer, rule)
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
