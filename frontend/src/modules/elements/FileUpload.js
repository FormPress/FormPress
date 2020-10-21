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

  constructor(props) {
    super(props)
    this.addFileButtonClicked = this.addFileButtonClicked.bind(this);
  }

  addFileButtonClicked(){

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
        <form class="file-form">
          <input type="file" id="file-input" name="fileUpload" />

          <label for="file-input">
            <img id="file-image" class="hidden" src="#" alt="Preview"></img>

            <div id="file-not-uploaded">
              <i class="fa fa-cloud-upload"></i>
              <p id="click-here-text">Click to the button below or <br></br>drag&drop your file here to upload</p>
              <button id="add-file-btn" class="btn add-file-btn" onChange={this.addFileButtonClicked}>Add File</button>
            </div>
          </label>
        </form>

      </ElementContainer>
    )
  }
}
