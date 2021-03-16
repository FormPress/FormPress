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
  disabled: {
    rule: {
      type: 'all'
    },
    configurableSettings: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: 'Make this field disabled?'
      }
    }
  }
}

export function getConfigurableSettings(questionType) {
  let willReturnObject = {}

  Object.keys(policy).map(function (objectKey, index) {
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
