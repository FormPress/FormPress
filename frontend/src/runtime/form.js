(async () => {
  const loadScript = (name) => new Promise((resolve, reject) => {
    const script = document.createElement('script')

    script.onload = resolve
    script.src = `${BACKEND}/runtime/${name}.js`
    document.head.appendChild(script)
  })
  const extensions = [{
    name: 'required',
    check: (element) => (element.required === true)
  }]
  const api = ({
    resource,
    method = 'get',
    body,
    useAuth = false
  }) => new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Content-Type': 'application/json'
      },
      method
    }

    if (typeof body !== 'undefined') {
      options.body = (typeof body === 'object')
        ? JSON.stringify(body)
        : body
    }

    let success = true
    let status

    fetch(`${BACKEND}${resource}`, options).then((response) => {
      success = response.ok
      status = response.status

      return response.json()
    }).then((data) => {
      resolve({ success, status, data })
    }).catch(reject)
  })

  console.log('MAIN FORM RUNTIME LOADED')
  console.log('SHOULD LOAD FORM ID QUESTIONS ', FORMID)

  const result = await api({
    resource: `/api/users/${USERID}/forms/${FORMID}/elements`
  })

  if (result.success === false) {
    return alert('Error while loading questions')
  }

  const elements = result.data

  // set global FORMPRESS object
  window.FORMPRESS = {
    api,
    formId: FORMID,
    userId: USERID,
    BACKEND,
    elements
  }


  const extensionstoLoad = []

  for (const ext of extensions) {
    const matchingElements = elements.filter(ext.check)

    if (elements.filter(ext.check).length > 0) {
      extensionstoLoad.push(ext.name)
    }
  }

  await Promise.all(extensionstoLoad.map(loadScript))
  console.log('All dependencies are loaded')

})()