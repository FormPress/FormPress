import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

export default class Name extends Component {
  static weight = 7

  static defaultConfig = {
    id: 0,
    type: 'Name',
    label: 'Full Name'
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
        <table>
          <tr>
              <td>
                <label for='firstname'>First name:</label>
              </td>
              <td>
                <input type='text' id='fname' name='firstname'></input>
              </td>
          </tr>
          <tr>
              <td>
                <label for='lastname'>Last name:</label>
              </td>
              <td>
                <input type='text' id='lname' name='lastname'></input>
              </td>
          </tr>
        </table>
      </ElementContainer>
    )
  }
}
