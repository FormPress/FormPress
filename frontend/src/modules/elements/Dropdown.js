import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

import './Dropdown.css'

export default class Dropdown extends Component {
  static weight = 5

  static defaultConfig = {
    id: 0,
    type: 'Dropdown',
    label: 'Dropdown',
    options: ['Dropdown 1'],
    dropdownOptions: {
      default: ['Dropdown 1'],
      formProps: {
        type: 'TextArea',
        label: 'Enter Dropdown options'
      }
    }
  }

  static renderDataValue(entry) {
    return entry.value
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof config.value !== 'undefined') {
      inputProps.checked = config.value === true
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    const options =
      Array.isArray(config.options) === true ||
      typeof config.options !== 'undefined'
        ? config.options
        : ['']

    var display
    if (mode === 'builder') {
      display = [
        <EditableLabel
          key="1"
          className="fl label"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          data-placeholder="Type a question"
          value={config.label}
          required={config.required}
        />,
        <div key="2">
          {
            <div className="dropdown-div">
              <select
                className="dropdown-select"
                id={`q_${config.id}`}
                name={`q_${config.id}`}
                defaultValue="choose-disabled">
                <option disabled value="choose-disabled">
                  Choose one
                </option>
                {options.map((item) => {
                  return (
                    <option className="option-space" key={item} value={item}>
                      {item}
                    </option>
                  )
                })}
              </select>
            </div>
          }
        </div>,
        <div className="clearfix" key="3">
          <EditableLabel
            className="sublabel"
            mode={mode}
            data-placeholder="Type a sublabel"
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
      ]
    } else {
      display = [
        <EditableLabel
          key="1"
          className="fl label"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />,
        <div key="2" className="dropdown-div">
          <select
            className="dropdown-select"
            id={`q_${config.id}`}
            name={`q_${config.id}`}
            defaultValue="choose-disabled">
            <option disabled value="choose-disabled">
              Choose one
            </option>
            {options.map((item) => {
              return (
                <option className="option-space" key={item} value={item}>
                  {item}
                </option>
              )
            })}
          </select>
        </div>,
        <div className="clearfix" key="3">
          <EditableLabel
            className="sublabel"
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
        </div>,
        <div key="4" className="fl metadata">
          <div className="requiredErrorText">{config.requiredText}</div>
        </div>
      ]
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        {display}
      </ElementContainer>
    )
  }
}
