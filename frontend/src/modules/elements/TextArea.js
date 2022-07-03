import React, { Component } from 'react'
import { Editor } from '@tinymce/tinymce-react'
const BACKEND = process.env.REACT_APP_BACKEND

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
      if (config.id === 'correctAnswer') {
        inputProps.value = config.value
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
          form_id={config.form_id}
          question_id={config.id}
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
            ) : config.id === 'correctAnswer' ? (
              <div>
                <textarea
                  id={`q_${config.id}`}
                  name={`q_${config.id}`}
                  className="hidden"
                  {...inputProps}></textarea>
                <Editor
                  apiKey="8919uh992pdzk74njdu67g6onb1vbj8k8r9fqsbn16fjtnx2"
                  value={config.value}
                  init={{
                    plugins: 'link image code',
                    toolbar:
                      'undo redo | formatselect | ' +
                      'bold italic backcolor | alignleft aligncenter ' +
                      'alignright alignjustify | outdent indent removeformat image ',
                    file_picker_types: 'image',
                    automatic_uploads: true,
                    images_file_types: 'jpg,svg,png',
                    images_upload_url: `${BACKEND}/api/upload/${config.form_id}/correctAnswer`,
                    image_dimensions: false,
                    resize: false,
                    paste_block_drop: true
                  }}
                  onEditorChange={(newValue) => {
                    inputProps.onChange(newValue)
                  }}
                />
              </div>
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
