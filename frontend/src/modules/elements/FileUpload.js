import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import './FileUpload.css'

export default class FileUpload extends Component {
  static weight = 8

  static defaultConfig = {
    id: 0,
    type: 'FileUpload',
    label: 'File Upload',
    requiredText: 'Please fill this field.'
  }

  static configurableSettings = {
    required: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: 'Make this field required'
      }
    }
  }

  static renderDataValue(entry) {
    if (entry.value !== '') {
      const parsedValue = JSON.parse(entry.value)
      const values = parsedValue.map((file, index) => (
        <Link
          to={`/download/${entry.form_id}/${entry.submission_id}/${
            entry.question_id
          }/${encodeURI(file.fileName)}`}
          target="_blank"
          key={index}>
          {file.fileName}
          <br />
        </Link>
      ))
      return values
    } else {
      return ''
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
      <input type="file" name={`q_${config.id}`} id={`q_${config.id}`} />
    )

    return (
      <ElementContainer type={config.type} {...this.props}>
        <EditableLabel
          className="fl label"
          mode={mode}
          labelKey={config.id}
          dataPlaceholder="Type a question"
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
        {display}
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
        <div className="fl metadata">
          <div className="requiredErrorText">{config.requiredText}</div>
        </div>
      </ElementContainer>
    )
  }
}
