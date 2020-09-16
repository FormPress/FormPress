import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

export default class Dropdown extends Component {
  static weight = 5

  static defaultConfig = {
    id: 0,
    type: 'Dropdown',
    label: 'Dropdown',
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
      show: true
    }
    this.handleChange = this.handleChange.bind(this);
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

    const options = (Array.isArray(config.options) === true)
      ? config.options
      : []

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    var display
    if (mode === 'builder') {
      display = [
        <EditableLabel
          key='1'
          className='fl label'
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />,
        <div key='2'>
          <button onClick={() => { this.setState({ show: !this.state.show }) }}>{this.state.show ? 'Preview' : 'Edit'}</button>&emsp;
          {
            this.state.show
              ?
              <textarea onChange={this.handleChange}>
                {config.options.join('\n')}
              </textarea>
              :
              <select>
                {
                  options.map((item) => { return (<option key={item} value={item}>{item}</option>) })
                }
              </select>
          }
        </div>
      ]
    }
    else {
      display = [
        <EditableLabel
          key='1'
          className='fl label'
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />,
        <div key='2'>
          <select>
            {
              options.map((item) => { return (<option key={item} value={item}>{item}</option>) })
            }
          </select>
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
