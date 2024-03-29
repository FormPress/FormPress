import datasets from '../datasets'

const policy = {
  customFieldId: {
    rule: {
      type: 'all'
    },
    configurableSettings: {
      default: '',
      formProps: {
        type: 'TextBox',
        label: 'Custom Field ID',
        placeholder: 'Enter a custom field ID',
        maxLength: 20
      }
    }
  },
  required: {
    rule: {
      type: 'exceptAll',
      exceptions: [
        'Button',
        'Header',
        'Separator',
        'PageBreak',
        'Image',
        'CAPTCHA'
      ]
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
      exceptions: [
        'Button',
        'Header',
        'Separator',
        'PageBreak',
        'Image',
        'CAPTCHA'
      ]
    },
    configurableSettings: {
      default: 'Required field',
      isVisible: (config) => {
        return config.required === true
      },
      formProps: {
        type: 'TextBox',
        label: 'Error message when this field is left empty.',
        placeholder: 'Required field'
      }
    }
  },
  hidden: {
    rule: {
      type: 'only',
      exceptions: ['TextBox', 'TextArea', 'Email']
    },
    configurableSettings: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Hide this field']
      }
    }
  },
  placeholder: {
    rule: {
      type: 'only',
      exceptions: ['TextBox', 'TextArea', 'Email', 'Dropdown']
    },
    configurableSettings: {
      default: '',
      formProps: {
        type: 'TextBox',
        label: 'Placeholder Text',
        placeholder: 'Enter a placeholder text'
      }
    }
  },
  hasDataset: {
    rule: {
      type: 'only',
      exceptions: ['Dropdown']
    },
    configurableSettings: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Predefined options']
      }
    }
  },
  dataset: {
    rule: {
      type: 'only',
      exceptions: ['Dropdown']
    },
    configurableSettings: {
      default: 'countries',
      isVisible: (config) => {
        return config.hasDataset === true
      },
      formProps: {
        type: 'Dropdown',
        label: 'Choose a data set',
        placeholder: false,
        options: datasets
      }
    }
  }
}

export const getConfigurableSettings = (questionType) => {
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
