;(async () => {
  const policy = {
    required: {
      rule: {
        type: 'exceptAll',
        exceptions: ['Button']
      },
      configurableSettings: {
        default: false,
        formProps: {
          type: 'Checkbox',
          label: 'Make this field required?'
        }
      }
    },
    requiredText: {
      rule: {
        type: 'exceptAll',
        exceptions: ['Button']
      },
      configurableSettings: {
        default: 'Please fill this field.',
        formProps: {
          type: 'Text',
          label: 'Error text when this field is left empty.'
        }
      }
    },
    placeholder: {
      rule: {
        type: 'only',
        exceptions: ['Text', 'TextArea']
      },
      configurableSettings: {
        default: 'Please enter the information',
        formProps: {
          type: 'Text',
          label: 'Describe the expected value of an input field.'
        }
      }
    },
    toggle: {
      rule: {
        type: 'only',
        exceptions: ['Checkbox']
      },
      configurableSettings: {
        default: false,
        formProps: {
          type: 'Checkbox',
          label: 'Make this field toggle?'
        }
      }
    },
    dropdownOptions: {
      rule: {
        type: 'only',
        exceptions: ['Dropdown']
      },
      configurableSettings: {
        default: ['Dropdown 1'],
        formProps: {
          type: 'TextArea',
          label: 'Enter Dropdown options'
        }
      }
    }
  }
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

  const result = await api({
    resource: `/api/users/${USERID}/forms/${FORMID}/elements`
  })

  if (result.success === false) {
    return alert('Error while loading questions')
  }

  const elements = result.data

  function getConfigurableSettings(questionType) {
    let willReturnObject = {}

    Object.keys(policy).map(function (objectKey) {
      const rule = policy[objectKey].rule
      if (
        rule.type === 'exceptAll' &&
        rule.exceptions.indexOf(questionType) === -1
      ) {
        willReturnObject[objectKey] = policy[objectKey].configurableSettings
      } else if (
        rule.type === 'only' &&
        rule.exceptions.indexOf(questionType) > -1
      ) {
        willReturnObject[objectKey] = policy[objectKey].configurableSettings
      } else if (rule.type === 'all') {
        willReturnObject[objectKey] = policy[objectKey].configurableSettings
      }
      return {}
    })

    return willReturnObject
  }

  const getElementsConfigurableSettingsObject = () =>
    Object.values(elements).reduce((acc, element) => {
      acc[element.type] = {
        configurableSettings: getConfigurableSettings(element.type)
      }

      return acc
    }, {})

  /*elements.map((e, i) => {
    for (const elem in getElementsConfigurableSettingsObject()[e.type]
      .configurableSettings) {
      if (elem in e !== true) {
        elements[i]['mode'] = 'sort'
        elements[i][elem] = getElementsConfigurableSettingsObject()[
          e.type
        ].configurableSettings[elem].default
      }
    }
  })

  console.log(elements)*/

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
