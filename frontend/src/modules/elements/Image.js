import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage, faFileUpload } from '@fortawesome/free-solid-svg-icons'

import './Image.css'

const BACKEND = process.env.REACT_APP_BACKEND

export default class Image extends Component {
  constructor(props) {
    super(props)
  }

  static weight = 16

  static defaultConfig = {
    id: 0,
    type: 'Image',
    label: 'Image',
    requiredText: 'Please fill this field.'
  }

  static metaData = {
    icon: faImage,
    displayText: 'Image'
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
      let fileUploadPath =
        'https://storage.googleapis.com/formpress-stage-test-fileuploads/'
      if (process.env.FP_ENV === 'production') {
        fileUploadPath = 'https://storage.googleapis.com/fp-uploads-production/'
      }

      const values = parsedValue.map((file, index) => (
        <img
          src={`${fileUploadPath}${encodeURI(file.uploadName)}`}
          target="_blank"
          key={index}
        />
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

    var display
    if (mode === 'builder' || mode === 'viewer') {
      display
    }

    const script = (
      <script
        dangerouslySetInnerHTML={{
          __html: `
          var image_drop_area = document.querySelector('#label_${config.id}');
          var image_area = document.querySelector('#q_${config.id}');
          var file_content = document.querySelector('#file-content_${config.id}');
          var uploaded_image_${config.id};

          image_drop_area.addEventListener('dragover', (event) => {
            event.stopPropagation();
            event.preventDefault();
            image_area.classList.add('file-input--active')
            event.dataTransfer.dropEffect = 'copy';
          });

          image_drop_area.addEventListener('dragleave', (event) => {
            event.stopPropagation();
            event.preventDefault();
            image_area.classList.remove('file-input--active');
          });

          image_drop_area.addEventListener('drop', (event) => {
            event.stopPropagation();
            event.preventDefault();
            fileList = event.dataTransfer.files;

            image_area.classList.remove('file-input--active')
            file_content.classList.add('hidden');
            readImage${config.id}(fileList[0]);
          });

          image_area.addEventListener('change', function(e) {
            if(image_area.files.length == 0) {
              file_content.classList.remove('hidden');
              document.querySelector('#label_${config.id}').style.backgroundImage = '';
            }else {
              fileList = image_area.files;

              image_area.classList.remove('file-input--active')
              file_content.classList.add('hidden');
              readImage${config.id}(fileList[0]);
            }
          });

          readImage${config.id} = async (file) => {
            var blob${config.id} = new Blob([new Uint8Array(await file.arrayBuffer())], {type: file.type });
            var blobURL${config.id} = URL.createObjectURL(blob${config.id});
            document.querySelector('#label_${config.id}').style.backgroundImage = 'url('+blobURL${config.id}+')';
          }`
        }}
      />
    )

    return (
      <ElementContainer type={config.type} {...this.props}>
        <div className="elemLabelTitle" key={0}>
          <EditableLabel
            key={1}
            className="fl label"
            dataPlaceholder="Type a question"
            mode={mode}
            labelKey={config.id}
            handleLabelChange={this.props.handleLabelChange}
            value={config.label}
            required={config.required}
          />
        </div>
        <div className="file-container" key={2}>
          <label
            className="file-wrapper"
            htmlFor={`q_${config.id}`}
            id={`label_${config.id}`}>
            <input
              className="file-input"
              id={`q_${config.id}`}
              type="file"
              accept="image/*"
              name={`q_${config.id}`}
              onChange={this.handleChange}
            />
            <div id={`file-content_${config.id}`} className="file-content">
              <div className="file-infos">
                <p className="file-icon">
                  <FontAwesomeIcon icon={faFileUpload} size="6x" />
                  <span className="icon-shadow"></span>
                  <span>
                    Click to browse
                    <span className="has-drag"> or drop image here</span>
                  </span>
                </p>
              </div>
            </div>
          </label>
        </div>
        {mode === 'viewer' ? (
          ''
        ) : (
          <div className="clearfix" key={3}>
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
            {script}
          </div>
        )}
      </ElementContainer>
    )
  }
}
