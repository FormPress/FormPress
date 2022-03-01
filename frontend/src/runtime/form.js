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
      check: (element) => element.required === true
    },
    {
      name: '3rdparty/iframeSizer.contentWindow.min',
      check: () => window.location !== window.parent.location
    },
    {
      name: 'validate',
      check: () => formHasValidators === true
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

  const elementsQuery = await api({
    resource: `/api/users/${USERID}/forms/${FORMID}/elements`
  })

  if (elementsQuery.success === false) {
    return alert('Error while loading questions.')
  }

  const elements = elementsQuery.data

  // set global FORMPRESS object
  window.FORMPRESS = {
    api,
    formId: FORMID,
    userId: USERID,
    BACKEND,
    elements
  }

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
    if (value !== 'unset') {
      return eval(value)
    }
    return value
  })

  const formHasValidators = !Object.values(window.FP_ELEMENT_HELPERS).every(
    (value) => value === 'unset'
  )

  const extensionstoLoad = []

  for (const ext of extensions) {
    if (elements.filter(ext.check).length > 0) {
      extensionstoLoad.push(ext.name)
    }
  }

  await Promise.all(extensionstoLoad.map(loadScript))
  console.log('All dependencies are loaded')
})()
