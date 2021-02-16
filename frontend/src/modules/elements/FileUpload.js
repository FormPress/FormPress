import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'
import './FileUpload.css'

export default class FileUpload extends Component {
  static weight = 8

  static defaultConfig = {
    id: 0,
    type: 'FileUpload',
    label: 'File Upload'
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

  constructor(props) {
    super(props)
    this.state = {
      uploadedFile: null,
      uploadState: 0 //0-default, 1-in progress, 2-success, 3-error
    }
    this.addFileButtonClicked = this.addFileButtonClicked.bind(this)
    this.cancelButtonClicked = this.cancelButtonClicked.bind(this)
    this.handleFileSelect = this.handleFileSelect.bind(this)
  }

  handleFileSelect = (e) => {
    e.preventDefault()
    const fileSelector = document.createElement('input')
    fileSelector.setAttribute('id', 'selector')
    fileSelector.setAttribute('type', 'file')
    fileSelector.addEventListener('change', this.addFileButtonClicked, false)
    fileSelector.click()
  }

  addFileButtonClicked(e) {
    this.setState({
      uploadedFile: null,
      uploadState: 1
    })

    var file = e.target.files[0]
    if (file !== null) {
      console.log('A', file.name)
      this.setState({
        uploadedFile: file,
        uploadState: 0
      })
    } else {
      this.setState({
        uploadedFile: file,
        uploadState: 3
      })
    }
    e.target.value = null
  }

  cancelButtonClicked() {
    this.setState({
      uploadedFile: null,
      uploadState: 0
    })
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

    var display
    if (this.state.uploadState === 0) {
      display = (
        <div className="box_default">
          <button type="button" id="cloud_button">
            <FontAwesomeIcon icon={faCloudUploadAlt} />
          </button>
          <input
            type="file"
            name="files[]"
            id="file"
            data-multiple-caption="{count} files selected"
            multiple
          />
          <label id="label_txt" htmlFor="file">
            <strong>Click to the button below or </strong>
            <span className="box_dragndrop">
              <br></br>drag&drop your file here to upload
            </span>
          </label>
          <button id="input_btn" onClick={this.handleFileSelect}>
            Add File
          </button>
        </div>
      )
    } else if (this.state.uploadState === 1) {
      display = (
        <div className="box_uploading">
          <div id="loader"></div>
          <label id="label_txt">
            {this.state.uploadedFile !== null
              ? this.state.uploadedFile.name
              : this.state.uploadState}{' '}
            is uploading...{' '}
          </label>
          <button id="cancel_button" onClick={this.cancelButtonClicked}>
            Cancel
          </button>
        </div>
      )
    } else if (this.state.uploadState === 3) {
      display = <div className="box_uploading"></div>
    }
    return (
      <ElementContainer type={config.type} {...this.props}>
        <EditableLabel
          className="fl label"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
        <form className="file-form">{display}</form>
      </ElementContainer>
    )
  }
}
