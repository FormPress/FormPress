import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

export default class Dropdown extends Component {
  static weight = 5

  static defaultConfig = {
    id: 0,
    type: 'Dropdown',
    label: 'Choose'
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
      options: []
    }
    this.toggleTextarea = this.toggleTextarea.bind(this)
  }

  componentDidMount(){
    this.state.options = JSON.parse(localStorage.getItem('dropdown'))
  }

  toggleTextarea() {
    var txt = document.getElementById("txt")
    var lines = txt.innerHTML.split('\n');

    if (txt.style.display === "none") {
      txt.style.display = "block"
    } else {
      txt.style.display = "none"
    }

    for (var i = 0; i < lines.length; i++) {
      this.setState({
        options: this.state.options.concat(lines[i])
      })
    }
    localStorage.setItem('dropdown', JSON.stringify(this.state.options))
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
          <button onClick={this.toggleTextarea} >Edit</button>
          <textarea id='txt' name='txtname' {...inputProps}></textarea>
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
        <input type='text' value={this.state.options.length}></input>
      ]
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        {display}
      </ElementContainer>
    )
  }
}