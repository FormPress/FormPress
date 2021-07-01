import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import './FileUpload.css'

export default class FileUpload extends Component {
  static weight = 8

  static defaultConfig = {
    id: 0,
    type: 'FileUpload',
    label: 'File Upload',
    requiredText: 'Please fill this field.',
    sublabelText: ''
  }

  static configurableSettings = {
    required: {
      default: false,
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

    const display = (
      <input
        type="file"
        name={`q_${config.id}`}
        id={`q_${config.id}`}
        data-multiple-caption="{count} files selected"
        multiple
      />
    )

    return (
      <ElementContainer type={config.type} {...this.props}>
        <EditableLabel
          className="fl label"
          mode={mode}
          labelKey={config.id}
          data-placeholder="Type a question"
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
        {display}
        <div className="clearfix">
          <EditableLabel
            className="sublabel"
            data-placeholder="Type a sublabel"
            mode={mode}
            labelKey={`sub_${config.id}`}
            handleLabelChange={this.props.handleLabelChange}
            value={
              typeof config.sublabelText !== 'undefined'
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
