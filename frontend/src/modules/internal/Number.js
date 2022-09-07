import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

import './Number.css'

export default class Number extends Component {
  static weight = 1

  static defaultConfig = {
    id: 0,
    type: 'Number',
    label: 'Number'
  }

  static configurableSettings = {
    required: {
      default: true,
      formProps: {
        type: 'Checkbox',
        label: 'Make this field required?'
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

    if (typeof config.min !== 'undefined') {
      inputProps.min = this.props.config.min
    }
    if (typeof config.max !== 'undefined') {
      inputProps.max = this.props.config.max
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        <h4>
        <EditableLabel
          className="fl label"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
        </h4>
        <div className="fl input">
          <input
            type="number"
            id={`q_${config.id}`}
            name={`q_${config.id}`}
            {...inputProps}
          />
        </div>
        <div className="clearfix">
        <h4>
          <EditableLabel
            className="sublabel"
            dataPlaceholder="Click to edit sublabel"
            mode={mode}
            labelKey={`sub_${config.id}`}
            handleLabelChange={this.props.handleLabelChange}
            value={
              typeof config.sublabelText !== 'undefined' &&
              config.sublabelText !== ''
                ? config.sublabelText
                : ''
            }
          />
          </h4>
        </div>
      </ElementContainer>
    )
  }
}
