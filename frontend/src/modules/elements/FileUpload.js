import React, { Component } from 'react'

import { Link } from 'react-router-dom'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import { faFileArrowUp } from '@fortawesome/free-solid-svg-icons'

import './FileUpload.css'

export default class FileUpload extends Component {
  static weight = 7

  static defaultConfig = {
    id: 0,
    type: 'FileUpload',
    label: 'File Upload',
    requiredText: 'Please fill this field.'
  }

  static metaData = {
    icon: faFileArrowUp,
    displayText: 'File Upload'
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

  static helpers = {
    getElementValue: 'defaultInputHelpers',
    isFilled: 'defaultInputHelpers'
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
    const script = (
      <script
        dangerouslySetInnerHTML={{
          __html: `
          var inputElement_${config.id} = document.getElementById('q_${config.id}');
          var selectedFile_${config.id};
            inputElement_${config.id}.addEventListener('change', function() {
              var fileDisplay = document.getElementById('fileDisplay_${config.id}');
              if(inputElement_${config.id}.files.length==0) {
                inputElement_${config.id}.files = selectedFile_${config.id};
                fileDisplay.innerHTML = inputElement_${config.id}.files[0].name + ' selected';
              }
              else {
                selectedFile_${config.id} = inputElement_${config.id}.files;
                fileDisplay.innerHTML = inputElement_${config.id}.files[0].name + ' selected';
              }
            }
          );`
        }}
      />
    )

    const display = (
      <input type="file" name={`q_${config.id}`} id={`q_${config.id}`} />
    )

    return (
      <ElementContainer type={config.type} {...this.props}>
        <h4>
        <EditableLabel
          className="fl label"
          mode={mode}
          labelKey={config.id}
          dataPlaceholder="Type a question"
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
        </h4>
        <div className="inputContainer">
          <label htmlFor={`q_${config.id}`} className="custom-file-upload">
            Browse...
          </label>
          {display}
          <span id={'fileDisplay_' + config.id} className="fileDisplay">
            No File Chosen
          </span>
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
        <div className="fl metadata">
          {script}
          <div className="requiredErrorText">{config.requiredText}</div>
        </div>
      </ElementContainer>
    )
  }
}
