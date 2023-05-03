;(async () => {
  const loadScript = (name) =>
    new Promise((resolve, reject) => {
      const script = document.createElement('script')

      script.onload = resolve
      script.src = `${BACKEND}/runtime/${name}.js`
      document.head.appendChild(script)
    })
  const extensions = [
    {
      name: 'required',
      check: (element) => element.required === true || formHasConditionalLogic
    },
    {
      name: '3rdparty/iframeSizer.contentWindow.min',
      check: () => window.location !== window.parent.location
    },
    {
      name: 'validate',
      check: () => formHasValidators === true
    },
    {
      name: 'datasets',
      check: (element) => element.hasDataset === true
    },
    {
      name: 'multistep',
      check: (element) => element.type === 'PageBreak' || formHasAutoPageBreaks
    },
    {
      name: 'conditional',
      check: () => formHasConditionalLogic === true
    }
  ]
  const api = ({ resource, method = 'get', body, useAuth = false }) =>
    new Promise((resolve, reject) => {
      const options = {
        headers: {
          'Content-Type': 'application/json'
        },
        method
      }

      if (typeof body !== 'undefined') {
        options.body = typeof body === 'object' ? JSON.stringify(body) : body
      }

      let success = true
      let status

      fetch(`${BACKEND}${resource}`, options)
        .then((response) => {
          success = response.ok
          status = response.status

          return response.json()
        })
        .then((data) => {
          resolve({ success, status, data })
        })
        .catch(reject)
    })

  console.log('MAIN FORM RUNTIME LOADED')
  console.log('SHOULD LOAD FORM ID QUESTIONS ', FORMID)

  let elements

  if (document.body.attributes.elements !== undefined) {
    elements = JSON.parse(document.body.attributes.elements.value)
    document.body.removeAttribute('elements')
  } else {
    const elementsQuery = await api({
      resource: `/api/users/${USERID}/forms/${FORMID}/elements`
    })
    elements = elementsQuery.data
  }

  if (!Array.isArray(elements)) {
    return alert('Error while loading questions.')
  }

  window.userAgent = navigator.userAgent.toLowerCase()

  // set global FORMPRESS object
  window.FORMPRESS = {
    api,
    formId: FORMID,
    userId: USERID,
    BACKEND,
    elements,
    requiredGoodToGo: true,
    validateGoodToGo: true
  }

  const rulesQuery = await api({
    resource: `/api/users/${USERID}/forms/${FORMID}/rules`
  })

  if (rulesQuery.success === false) {
    return alert('Error while loading form rules.')
  }

  window.FORMPRESS.rules = rulesQuery.data || []

  const formHasConditionalLogic = window.FORMPRESS.rules.length > 0

  const validatorsQuery = await api({
    resource: `/api/form/element/validators?elements=${elements
      .map((e) => e.type)
      .sort()
      .join(',')}`
  })

  if (validatorsQuery.success === false) {
    return alert('Error while loading element validators.')
  }

  const validators = validatorsQuery.data

  window.FP_ELEMENT_HELPERS = JSON.parse(validators, (key, value) => {
    if (value !== 'unset' && value !== 'defaultInputHelpers') {
      return eval(value)
    }
    return value
  })

  const defaultInputHelpers = {
    getElementValue: (id) => {
      const input = document.getElementById(`q_${id}`)
      return input.value
    },
    isFilled: (value) => {
      return value.trim().length > 0
    }
  }

  // set default input helpers
  for (const elemHelpers in FP_ELEMENT_HELPERS) {
    for (const helper in FP_ELEMENT_HELPERS[elemHelpers]) {
      if (FP_ELEMENT_HELPERS[elemHelpers][helper] === 'defaultInputHelpers') {
        FP_ELEMENT_HELPERS[elemHelpers][helper] = defaultInputHelpers[helper]
      }
    }
  }

  let formHasValidators = false

  for (const helper in FP_ELEMENT_HELPERS) {
    if (FP_ELEMENT_HELPERS.hasOwnProperty(helper)) {
      if (FP_ELEMENT_HELPERS[helper].isValid) {
        formHasValidators = true
      }
    }
  }

  let formHasAutoPageBreaks =
    document.querySelectorAll('.autoPageBreak').length > 0

  const extensionstoLoad = []

  for (const ext of extensions) {
    if (elements.filter(ext.check).length > 0) {
      extensionstoLoad.push(ext.name)
    }
  }

  await Promise.all(extensionstoLoad.map(loadScript))
  // unhide form
  document.body.style.display = 'block'

  const form = document.getElementById(`FORMPRESS_FORM_${FORMPRESS.formId}`)
  form.addEventListener('submit', (event) => {
    // Prevent default form submission behavior
    event.preventDefault()

    // Check if there is an input with name 'fp_rule_changeTyPage'
    const changeTyPageInputs = document.querySelectorAll(
      'input[name="fp_rule_changeTyPage"]'
    )
    if (changeTyPageInputs.length > 0) {
      // Extract the last value of 'fp_rule_changeTyPage'
      const lastChangeTypePage =
        changeTyPageInputs[changeTyPageInputs.length - 1]
      const pageId = lastChangeTypePage.value.trim()
      if (pageId !== '') {
        // Modify form action attribute to add 'tyPageId' parameter to the URL
        const formAction = form.action
        const formActionWithoutParams = formAction.split('?')[0]
        const separator = formAction.includes('?') ? '&' : '?'
        const newFormAction = `${formActionWithoutParams}${separator}tyPageId=${pageId}`
        form.action = newFormAction
      }
    }

    // Check if form is valid and submit if true, otherwise log an error message
    if (FORMPRESS.requiredGoodToGo && FORMPRESS.validateGoodToGo) {
      form.submit()
    } else {
      console.log('FORM IS NOT VALID')
    }
  })
  console.log('All dependencies are loaded')
})()
