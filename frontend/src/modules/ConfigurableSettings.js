const policy = {
  required: {
    rule: {
      type: 'exceptAll',
      exceptions: ['Button', 'Header']
    },
    configurableSettings: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Make this field required']
      }
    }
  },
  requiredText: {
    rule: {
      type: 'exceptAll',
      exceptions: ['Button', 'Header']
    },
    configurableSettings: {
      default: 'Please fill this field.',
      formProps: {
        type: 'TextBox',
        label: 'Error message when this field is left empty.'
      }
    }
  },
  placeholder: {
    rule: {
      type: 'only',
      exceptions: ['TextBox', 'TextArea', 'Email']
    },
    configurableSettings: {
      default: 'Please enter the information.',
      formProps: {
        type: 'TextBox',
        label: 'Describe the expected value of this input field.'
      }
    }
  }
}

exports.getConfigurableSettings = (questionType) => {
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
