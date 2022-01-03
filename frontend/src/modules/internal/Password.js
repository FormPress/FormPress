import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

import './Password.css'

export default class Password extends Component {
  static weight = 1

  static defaultConfig = {
    id: 0,
    type: 'Password',
    label: 'Password'
  }

  static configurableSettings = {
    required: {
      default: true,
      formProps: {
        type: 'Checkbox',
        label: 'Make this field required'
      }
    }
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        <EditableLabel
          className="fl label"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
        <div className="fl input">
          <input
            type="password"
            id={`q_${config.id}`}
            name={`q_${config.id}`}
            {...inputProps}
          />
        </div>
      </ElementContainer>
    )
  }
}
