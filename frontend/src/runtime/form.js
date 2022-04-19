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
    },
    {
      name: 'datasets',
      check: (element) => element.hasDataset === true
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
    elements,
    requiredGoodToGo: true,
    validateGoodToGo: true
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

  const extensionstoLoad = []

  for (const ext of extensions) {
    if (elements.filter(ext.check).length > 0) {
      extensionstoLoad.push(ext.name)
    }
  }

  // test emoji font
  let fontName = 'Twemoji Country Flags'
  let fontUrl =
    'https://cdn.jsdelivr.net/npm/country-flag-emoji-polyfill@0.1/dist/TwemojiCountryFlags.woff2'

  const style = document.createElement('style')
  style.textContent = `@font-face {
      font-family: "${fontName}";
      unicode-range: U+1F1E6-1F1FF, U+1F3F4, U+E0062-E0063, U+E0065, U+E0067,
        U+E006C, U+E006E, U+E0073-E0074, U+E0077, U+E007F;
      src: url('${fontUrl}') format('woff2');
    }`
  document.head.appendChild(style)

  await Promise.all(extensionstoLoad.map(loadScript))

  const form = document.getElementById(`FORMPRESS_FORM_${FORMPRESS.formId}`)
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    if (FORMPRESS.requiredGoodToGo && FORMPRESS.validateGoodToGo) {
      form.submit()
    } else {
      console.log('FORM IS NOT VALID')
    }
  })
  console.log('All dependencies are loaded')
})()
