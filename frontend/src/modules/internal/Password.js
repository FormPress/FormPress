import React from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

import './Password.css'

function Password(props) {
  const { config, mode } = props
  const inputProps = {}

  if (typeof config.value !== 'undefined') {
    inputProps.value = config.value
  }

  if (typeof props.onChange !== 'undefined') {
    inputProps.onChange = props.onChange
  }

  return (
    <ElementContainer type={config.type} {...props}>
      <div className="elemLabelTitle">
        <EditableLabel
          className="fl label"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
      </div>
      <div className="fl input">
        <input
          type="password"
          autoComplete="on"
          id={`q_${config.id}`}
          name={`q_${config.id}`}
          {...(inputProps || '')}
        />
      </div>
    </ElementContainer>
  )
}

Password.weight = 1
Password.defaultConfig = {
  id: 0,
  type: 'Password',
  label: 'Password'
}
Password.configurableSettings = {
  required: {
    default: true,
    formProps: {
      type: 'Checkbox',
      label: 'Make this field required'
    }
  }
}

export default Password
