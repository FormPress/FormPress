import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import { faAlignJustify } from '@fortawesome/free-solid-svg-icons'

import './TextArea.css'

export default class TextArea extends Component {
  static weight = 2

  static defaultConfig = {
    id: 0,
    type: 'TextArea',
    label: 'Long Text'
  }

  static metaData = {
    icon: faAlignJustify,
    displayText: 'Long Text'
  }

  static submissionHandler = {
    getQuestionValue: (inputs, qid) => {
      let value = ''
      for (const elem of inputs) {
        if (elem.q_id === qid) {
          value = elem.value
        }
      }
      return value
    }
  }

  static renderDataValue(entry) {
    return entry.value
  }

  static helpers = {
    getElementValue: 'defaultInputHelpers',
    isFilled: 'defaultInputHelpers'
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value

      if (config.id === 'dropdownOptions' && Array.isArray(config.value)) {
        inputProps.value = config.value.join('\n')
      }
      if (config.id === 'prefixOptions' && Array.isArray(config.value)) {
        inputProps.value = config.value.join('\n')
      }
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    if (typeof config.placeholder !== 'undefined') {
      inputProps.placeholder = config.placeholder
    }

    if (typeof config.maxLength !== 'undefined') {
      inputProps.maxLength = config.maxLength
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        <EditableLabel
          className="fl label"
          dataPlaceholder="Type a question"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
        <div>
          <div className="fl input">
            {config.id === 'dropdownOptions' ? (
              <textarea
                id={`q_${config.id}`}
                name={`q_${config.id}`}
                {...inputProps}></textarea>
            ) : (
              <textarea
                id={`q_${config.id}`}
                name={`q_${config.id}`}
                {...inputProps}></textarea>
            )}
          </div>
          {mode === 'viewer' ? (
            ''
          ) : (
            <div className="clearfix">
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
