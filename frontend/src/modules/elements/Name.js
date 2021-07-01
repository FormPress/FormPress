import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

export default class Name extends Component {
  static weight = 7

  static defaultConfig = {
    id: 0,
    type: 'Name',
    label: 'Full Name',
    sublabelText: ''
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
          className="fl label"
          mode={mode}
          labelKey={config.id}
          data-placeholder="Type a question"
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
        <div>
          <select>
            <option>Prefix</option>
            <option>Mr.</option>
            <option>Mrs.</option>
          </select>
          <input
            type="text"
            id="fname"
            name={`q_${config.id}[firstName]`}></input>
          <input
            type="text"
            id="mname"
            name={`q_${config.id}[middleName]`}></input>
          <input
            type="text"
            id="lname"
            name={`q_${config.id}[lastName]`}></input>
          <input
            type="text"
            id="suffix"
            name={`q_${config.id}[suffix]`}></input>
        </div>
        <table>
          <tr>
            <td>
              <label htmlFor="firstname">First name:</label>
            </td>
            <td>
              <input
                type="text"
                id="fname"
                name={`q_${config.id}[firstName]`}></input>
            </td>
          </tr>
          <tr>
            <td>
              <label htmlFor="lastname">Last name:</label>
            </td>
            <td>
              <input
                type="text"
                id="lname"
                name={`q_${config.id}[lastName]`}></input>
            </td>
          </tr>
        </table>
        <div className="clearfix">
          <EditableLabel
            className="sublabel"
            data-placeholder="Type a sublabel"
            mode={mode}
            labelKey={`sub_${config.id}`}
            handleLabelChange={this.props.handleLabelChange}
            value={
              typeof config.sublabelText !== 'undefined'
                ? config.sublabelText
                : ''
            }
          />
        </div>
        <div className="fl metadata">
          <div className="requiredErrorText">{config.requiredText}</div>
        </div>
      </ElementContainer>
    )
  }
}
