import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

import './Checkbox.css'

export default class Checkbox extends Component {
  static weight = 3

  static defaultConfig = {
    id: 0,
    type: 'Checkbox',
    label: 'Label',
    options: ['Checkbox 1']
  }

  constructor(props) {
    super(props)
    this.state = {
      show: true
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event) {
    const { config } = this.props
    const inputProps = {}
    let lines = event.target.value.split('\n')

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value
    }

    const newOptions = []

    for (let i = 0; i < lines.length; i++) {
      if (lines[i] && lines[i].trim().length !== 0) {
        newOptions.push(lines[i])
      }
    }

    this.props.configureQuestion({
      id: config.id,
      newState: {
        options: newOptions
      }
    })
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

    let display
    if (mode === 'builder') {
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
        <div key="2" className={config.toggle === true ? 'toggle' : ''}>
          {
            <div className="checkboxCover">
              {options.map((item, key) => {
                return (
                  <div className="fl input" key={key}>
                    <input
                      key={`s_${key}`}
                      type="checkbox"
                      id={`q_${config.id}_${key}`}
                      name={`q_${config.id}`}
                      value={item}
                      {...inputProps}
                    />
                    {config.toggle === true ? (
                      <span className="slider"></span>
                    ) : (
                      ''
                    )}
                    <EditableLabel
                      className="fl label checkbox-label"
                      mode={mode}
                      labelKey={`s_${config.id}_${key}`}
                      htmlFor={`q_${config.id}_${key}`}
                      handleLabelChange={this.props.handleLabelChange}
                      value={item}
                      required={config.required}
                    />
                  </div>
                )
              })}
            </div>
          }
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
        <div
          key="2"
          className={
            config.toggle === true ? 'checkboxCover toggle' : 'checkboxCover'
          }>
          {options.map((item, key) => {
            return (
              <div className="fl input" key={key}>
                <input
                  type="checkbox"
                  id={`q_${config.id}_${key}`}
                  name={`q_${config.id}`}
                  value={item}
                  {...inputProps}
                />
                {config.toggle === true ? <span className="slider"></span> : ''}
                <span
                  className="checkbox-label"
                  htmlFor={`q_${config.id}_${key}`}>
                  {item}
                </span>
              </div>
            )
          })}
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
