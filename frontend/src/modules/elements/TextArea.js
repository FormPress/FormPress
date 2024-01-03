import React, { Component } from 'react'
import { Editor } from '@tinymce/tinymce-react'

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
    displayText: 'Long Text',
    group: 'inputElement'
  }

  static submissionHandler = {
    findQuestionValue: (inputs, qid) => {
      let value = ''
      for (const elem of inputs) {
        if (elem.q_id === qid) {
          value = elem.value
        }
      }
      return value
    }
  }

  static getPlainStringValue(entry) {
    let plainString

    if (entry.value !== '') {
      plainString = entry.value
    } else {
      plainString = '-'
    }

    return plainString
  }

  static renderDataValue(entry) {
    return entry.value ? entry.value : '-'
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

      if (config.id === 'answerExplanation') {
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

    if (
      typeof config.customFieldId !== 'undefined' &&
      config.customFieldId !== ''
    ) {
      inputProps['data-fp-custom-field-id'] = 'q_' + config.customFieldId
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        <div className="elemLabelTitle">
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
        </div>
        <div className="fl input">
          {config.id === 'answerExplanation' ? (
            <>
              <textarea
                id={`q_${config.id}`}
                name={`q_${config.id}`}
                className="hidden"
                {...inputProps}></textarea>
              <Editor
                apiKey={global.env.FE_TINYMCE_API_KEY}
                value={config.value}
                init={{
                  plugins: 'link image code',
                  menubar: 'edit insert format',
                  toolbar:
                    'undo redo | formatselect | ' +
                    'bold italic forecolor | image ',
                  file_picker_types: 'image',
                  automatic_uploads: true,
                  image_dimensions: true,
                  images_file_types: 'jpg,svg,png,jpeg',
                  images_upload_handler: this.props.rteUploadHandler,
                  resize: false,
                  paste_block_drop: true,
                  paste_data_images: false
                }}
                onEditorChange={(newValue) => inputProps.onChange(newValue)}
              />
            </>
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
      </ElementContainer>
    )
  }
}
