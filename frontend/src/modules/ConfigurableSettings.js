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
        options: ['Make this field required?']
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
        label: 'Error text when this field is left empty.'
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
        label: '',
        options: ['Make this field toggle?']
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
  },
  prefix: {
    rule: {
      type: 'only',
      exceptions: ['Name']
    },
    configurableSettings: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Allow users to enter a title before their names.']
      }
    }
  },
  prefixTypeTextBox: {
    rule: {
      type: 'only',
      exceptions: ['Name']
    },
    configurableSettings: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Change the type of prefix field to TextBox.']
      }
    }
  },
  prefixOptions: {
    rule: {
      type: 'only',
      exceptions: ['Name']
    },
    configurableSettings: {
      default: ['Mr.'],
      formProps: {
        type: 'TextArea',
        label: 'Enter Prefix Options'
      }
    }
  },
  middleName: {
    rule: {
      type: 'only',
      exceptions: ['Name']
    },
    configurableSettings: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Allow users to enter a middle name.']
      }
    }
  },
  suffix: {
    rule: {
      type: 'only',
      exceptions: ['Name']
    },
    configurableSettings: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Allow users to enter a title after their names.']
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
