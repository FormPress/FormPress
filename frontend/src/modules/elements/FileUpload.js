import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

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

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        <EditableLabel
          className='fl label'
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
        <form id="file-upload-form-id" class="file-upload-form-class">
          <input type="file" id="file-upload" name="fileUpload" />

          <label for="file-upload" id="file-drag">
            <img id="file-image" src="#" alt="Preview" class="hidden"></img>
            
            <div id="start">
              <i class="fa fa-cloud-upload"></i>
              <p id="click-here-text">Click to the button below or <br></br>drag&drop your file here to upload</p>
              <span id="add-file-btn" class="btn add-file-btn">Add File</span>
            </div>
          </label>
        </form>

      </ElementContainer>
    )
  }
}
