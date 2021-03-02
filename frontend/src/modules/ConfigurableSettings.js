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
				return { required: policy.required.configurableSettings }
			} else {
				return {}
			}
		default:
		// code block
	}
}
