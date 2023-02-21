import React, { Component } from 'react'

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
    displayText: 'File Upload',
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

  static getPlainStringValue(entry, question) {
    let plainString

    if (entry.value !== '') {
      const files = JSON.parse(entry.value)

      plainString = ''

      files.forEach((file, index) => {
        plainString += `${
          process.env.FE_FRONTEND || global.env.FE_FRONTEND
        }/download/${question.form_id}/${entry.submission_id}/${
          question.id
        }/${encodeURI(file.fileName)}`

        if (index > 0) {
          plainString += ', '
        }
      })
    } else {
      return '-'
    }

    return plainString
  }

  static renderDataValue(entry, question) {
    if (entry.value !== '') {
      let files
      let imgExtensionArray = [
        'png',
        'jpg',
        'jpeg',
        'gif',
        'ico',
        'apng',
        'svg',
        'webp',
        'bmp'
      ]

      if (typeof entry.value === 'string') {
        files = JSON.parse(entry.value)
      } else {
        files = entry.value
      }
      return files.map((file, index) => (
        <>
          {imgExtensionArray.includes(file.uploadName.split('.').pop()) ? (
            <img
              id={`q${question.id}-file-${index}`}
              alt={`File: ${file.fileName}`}
              className="fileUpload-image"
              src={
                'https://storage.googleapis.com/' +
                process.env.FILE_UPLOAD_BUCKET +
                '/' +
                file.uploadName
              }
              style={{ maxWidth: '700px' }}
              onError={() => {
                document.getElementById(
                  `q${question.id}-file-${index}`
                ).style.display = 'none'
              }}
            />
          ) : null}
          <a
            href={`${
              process.env.FE_FRONTEND || global.env.FE_FRONTEND
            }/download/${question.form_id}/${entry.submission_id}/${
              question.id
            }/${encodeURI(file.fileName)}`}
            target="_blank"
            rel="noopener noreferrer"
            key={index}
            style={{ display: 'block' }}>
            {file.fileName}
            <br />
          </a>
        </>
      ))
    } else {
      return '-'
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
          var new_name = '';
          function changeName_${config.id}(file_name){
            var trMap = {
              'çÇ':'c',
              'ğĞ':'g',
              'şŞ':'s',
              'üÜ':'u',
              'ıİ':'i',
              'öÖ':'o',
              ' ':'_'
            }
            for(var key in trMap) {
              new_name = file_name.substring(0, file_name.lastIndexOf('.')).replace(new RegExp('['+key+']','g'), trMap[key]);
            }

            return new_name.replace(/[^-a-zA-Z0-9]+/ig, '').replace(/[-]+/gi, "-").toLowerCase() + '.' + file_name.substring(file_name.lastIndexOf('.') + 1, file_name.length)
          }

          var inputElement_${config.id} = document.getElementById('q_${config.id}');
          var selectedFile_${config.id};
            inputElement_${config.id}.addEventListener('change', function() {
              var fileDisplay = document.getElementById('fileDisplay_${config.id}');
              if(inputElement_${config.id}.files.length==0) {
                inputElement_${config.id}.files = selectedFile_${config.id};
                fileDisplay.innerHTML = changeName_${config.id}(inputElement_${config.id}.files[0].name) + ' selected';
              }
              else {
                selectedFile_${config.id} = inputElement_${config.id}.files;
                fileDisplay.innerHTML = changeName_${config.id}(inputElement_${config.id}.files[0].name) + ' selected';
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
        <div className="elemLabelTitle">
          <EditableLabel
            className="fl label"
            mode={mode}
            labelKey={config.id}
            dataPlaceholder="Type a question"
            handleLabelChange={this.props.handleLabelChange}
            value={config.label}
            required={config.required}
          />
        </div>
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
          {script}
          <div className="requiredErrorText">{config.requiredText}</div>
        </div>
      </ElementContainer>
    )
  }
}
