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
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const { config } = this.props
    const inputProps = {}
    var lines = event.target.value.split('\n')

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value
    }

    config.options = []
    for (var i = 0; i < lines.length; i++) {
      config.options = config.options.concat(lines[i])
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
          <textarea onChange={this.handleChange}></textarea>
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
              config.options.map((item) => { return (<option key={item} value={item}>{item}</option>) })
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