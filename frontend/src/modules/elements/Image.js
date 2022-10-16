import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import { faImage } from '@fortawesome/free-solid-svg-icons'

import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'

import './Image.css'

export default class Image extends Component {
  constructor(props) {
    super(props)

    this.state = {
      image: '',
      cropData: '',
      cropper: undefined
    }
  }

  static weight = 16

  static defaultConfig = {
    id: 0,
    type: 'Image',
    label: 'Image',
    requiredText: 'Please fill this field.',
    uploadedImageUrl: ''
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
          alt=""
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

  onChange = (e) => {
    e.preventDefault()
    let files
    if (e.dataTransfer) {
      files = e.dataTransfer.files
    } else if (e.target) {
      files = e.target.files
    }
    const reader = new FileReader()
    reader.onload = () => {
      this.setState({ image: reader.result })
    }
    reader.readAsDataURL(files[0])
  }

  getCropData = () => {
    if (typeof this.state.cropper !== 'undefined') {
      this.setState({
        cropData: this.state.cropper.getCroppedCanvas().toDataURL()
      })
    }
  }

  render() {
    const { config, mode } = this.props

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
        <div>
          <div style={{ width: '100%' }}>
            <input type="file" onChange={this.onChange} />
            <button>Use default img</button>
            <br />
            <br />
            <Cropper
              style={{ height: 400, width: '100%' }}
              zoomTo={0.5}
              initialAspectRatio={1}
              preview=".img-preview"
              viewMode={1}
              minCropBoxHeight={10}
              minCropBoxWidth={10}
              background={false}
              responsive={true}
              autoCropArea={1}
              checkOrientation={false}
              onInitialized={(instance) => {
                this.setState({ cropper: instance })
              }}
              guides={true}
            />
          </div>
          <div>
            <div className="box" style={{ width: '50%', float: 'right' }}>
              <h1>Preview</h1>
              <div
                className="img-preview"
                style={{ width: '100%', float: 'left', height: '300px' }}
              />
            </div>
            <div
              className="box"
              style={{ width: '50%', float: 'right', height: '300px' }}>
              <h1>
                <span>Crop</span>
                <button style={{ float: 'right' }} onClick={this.getCropData}>
                  Crop Image
                </button>
              </h1>
              <img
                style={{ width: '100%' }}
                src={this.state.cropData}
                alt="cropped"
              />
            </div>
          </div>
          <br style={{ clear: 'both' }} />
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
          </div>
        )}
      </ElementContainer>
    )
  }
}
