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
      cropper: undefined,
      cropPhase: props.config.uploadedImageUrl ? 3 : 1,
      croppedImage: props.config.uploadedImageUrl || ''
    }

    this.cropperRef = React.createRef()
  }

  static weight = 8

  static defaultConfig = {
    id: 0,
    type: 'Image',
    label: 'Image',
    uploadedImageUrl: ''
  }

  static metaData = {
    icon: faImage,
    displayText: 'Image'
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
      this.setState({ croppedImage: reader.result, cropPhase: 2 })
    }

    reader.readAsDataURL(files[0])
  }

  getCropData = () => {
    if (typeof this.state.cropper !== 'undefined') {
      const croppedImage = this.state.cropper
        .getCroppedCanvas({
          minWidth: 256,
          minHeight: 256,
          maxWidth: 4096,
          maxHeight: 4096,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
          fillColor: '#fff'
        })
        .toDataURL('image/jpeg', 1)
      this.setState({
        croppedImage: croppedImage,
        cropPhase: 3
      })
      this.props.imageUploadHandler(this.props.config.id, croppedImage)
    }
  }

  render() {
    const { config, mode } = this.props
    let processDisplay

    if (mode !== 'renderer') {
      if (this.state.cropPhase === 1) {
        processDisplay = (
          <div className="inputContainer">
            <label
              htmlFor={`temp_q_${config.id}`}
              className="image_container_before_upload">
              Browse an image...
            </label>
            <input
              type="file"
              id={`temp_q_${config.id}`}
              accept="image/jpg, image/jpeg, image/jfif, image/pjpeg, image/pjp, image/png, image/webp"
              onChange={this.onChange}
            />
          </div>
        )
      }
      if (this.state.cropPhase === 2) {
        processDisplay = (
          <div>
            <div style={{ width: '100%' }}>
              <Cropper
                style={{ height: 400, width: '100%' }}
                zoomTo={0.5}
                preview=".img-preview"
                src={this.state.croppedImage}
                viewMode={2}
                autoCropArea={1}
                background={false}
                cropBoxResizable={true}
                cropBoxMovable={true}
                maxCropBoxWidth={640}
                maxCropBoxHeight={400}
                responsive={true}
                checkOrientation={false}
                onInitialized={(instance) => {
                  this.setState({ cropper: instance })
                }}
                guides={true}
              />
            </div>
            <br />
            <button className="crop-button" onClick={this.getCropData}>
              Crop Image
            </button>
          </div>
        )
      }
      if (this.state.cropPhase === 3) {
        processDisplay = (
          <div>
            <label htmlFor={`q_${config.id}`} className="custom_image_upload">
              <div className="label_hover_background">
                <span>
                  This is preview section of cropped image. <br /> You can click
                  to add a new image.
                </span>
              </div>
              <input
                type="file"
                id={`q_${config.id}`}
                accept="image/jpg, image/jpeg, image/jfif, image/pjpeg, image/pjp, image/png, image/webp"
                onChange={this.onChange}
              />
              <img
                src={this.state.croppedImage}
                className="cropped_image"
                alt=""
              />
            </label>
          </div>
        )
      }
    } else {
      processDisplay = (
        <label className="custom_image_upload">
          <img src={this.state.croppedImage} className="cropped_image" alt="" />
        </label>
      )
    }

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
        {processDisplay}
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
