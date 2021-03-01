const policy = {
	required: {
		rule: {
			type: 'exceptAll',
			exceptions: ['TextArea', 'Button']
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
function getConfigurableSettingsAccordingToType(questionType) {
	//this will be determined only by type
	switch (policy.required.rule.type) {
		case 'all':
			// code block
			break
		case 'exceptAll':
			if (policy.required.rule.exceptions.indexOf(questionType) == -1) {
				//this will be returned attr name with configSettings
				return { required: policy.required.configurableSettings }
			} else {
				return {}
			}
			break
		case 'only':
			break
		default:
		// code block
	}
}

export function getConfigurableSettings(
	questionType,
	externalConfigurableSettings = {}
) {
	return getConfigurableSettingsAccordingToType(questionType)
}
