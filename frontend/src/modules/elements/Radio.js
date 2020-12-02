import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

import './Radio.css'

export default class Radio extends Component {
  static weight = 6

  static defaultConfig = {
    id: 0,
    type: 'Radio',
    label: 'Radio',
    options: []
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
      show: true,
      checked: 0
    }
    this.handleChange = this.handleChange.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  onChange(i) {
    this.setState({
      checked: i
    })
  }

  handleChange(event) {
    const { config } = this.props
    const inputProps = {}
    var lines = event.target.value.split('\n')

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value
    }

    const newOptions = []

    for (var i = 0; i < lines.length; i++) {
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

    if (typeof config.onClick !== 'undefined') {
      inputProps.onClick = config.onClick
    }

    let optionsList =
      Array.isArray(config.options) === true &&
      config.options.map((item, key) => {
        return (
          <li key={key}>
            <input type="radio" id="radio-btn" name="radio-btn"></input>
            <label htmlFor="radio-btn">{item}</label>
            <div className="check">
              <div className="inside"></div>
            </div>
          </li>
        )
      })

    var display
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
        <div key="2">
          {this.state.show ? (
            <textarea id="options-textarea" onChange={this.handleChange}>
              {config.options.join('\n')}
            </textarea>
          ) : (
            <div className="container">
              <p id="choose-option">Choose an option:</p>
              <ul className="radio-container">{optionsList}</ul>
            </div>
          )}
          <button
            id="edit-preview-button"
            onClick={() => {
              this.setState({ show: !this.state.show })
            }}>
            {this.state.show ? 'Preview' : 'Edit'}
          </button>
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
        <div key="2">
          <div className="container">
            <p id="choose-option-par">Choose an option:</p>
            <ul>{optionsList}</ul>
          </div>
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
