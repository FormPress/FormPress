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
  }
}

export function getConfigurableSettings(questionType) {
  switch (policy.required.rule.type) {
    case 'all':
      // code block
      break
    case 'only':
      // code block
      break
    case 'exceptAll':
      if (policy.required.rule.exceptions.indexOf(questionType) === -1) {
        //this will be returned attr name with configSettings
        return {
          required: policy.required.configurableSettings,
          requiredText: policy.requiredText.configurableSettings
        }
      } else {
        return {}
      }
    default:
    // code block
  }
}
