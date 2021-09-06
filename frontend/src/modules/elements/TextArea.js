import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

import './TextArea.css'

export default class TextArea extends Component {
  static weight = 2

  static defaultConfig = {
    id: 0,
    type: 'TextArea',
    label: 'TextArea'
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
          data-placeholder="Type a question"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
        <div>
          <div className="fl input">
            <textarea
              id={`q_${config.id}`}
              name={`q_${config.id}`}
              {...inputProps}></textarea>
          </div>
          {mode === 'viewer' ? (
            ''
          ) : (
            <div className="clearfix">
              <EditableLabel
                className="sublabel"
                data-placeholder="Type a sublabel"
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
            </div>
          )}
          <div className="fl metadata">
            <div className="requiredErrorText">{config.requiredText}</div>
          </div>
        </div>
      </ElementContainer>
    )
  }
}
