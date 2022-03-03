import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import './Email.css'

export default class Email extends Component {
  static weight = 9

  static defaultConfig = {
    id: 0,
    type: 'Email',
    label: 'Email'
  }

  static helpers = {
    getElementValue: (id) => {
      const email = document.getElementById(`q_${id}`)
      return email.value
    },
    isValid: (value) => {
      return value.trim().indexOf('@') > -1
    },
    isFilled: (value) => {
      return value.trim() !== ''
    }
  }

  static renderDataValue(entry) {
    return entry.value
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

    if (typeof config.placeholder !== 'undefined') {
      inputProps.placeholder = config.placeholder
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        <EditableLabel
          className="fl label"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          dataPlaceholder="Type a question"
          value={config.label}
          required={config.required}
        />
        <div className="fl input">
          <input
            id={`q_${config.id}`}
            name={`q_${config.id}`}
            {...inputProps}
          />
        </div>
        <div className="clearfix">
          <EditableLabel
            className="sublabel"
            mode={mode}
            dataPlaceholder="Click to edit sublabel"
            labelKey={`sub_${config.id}`}
            handleLabelChange={this.props.handleLabelChange}
            value={
              typeof config.sublabelText !== 'undefined' &&
              config.sublabelText !== ''
                ? config.sublabelText
                : ''
            }
          />
        </div>
        <div className="fl metadata">
          <div className="requiredErrorText">{config.requiredText}</div>
        </div>
      </ElementContainer>
    )
  }
}
