import React, { Component } from 'react'

export default class EditableLabel extends Component {
  constructor (props) {
    super(props)

    this.handleOnInput = this.handleOnInput.bind(this)
    this.handleOnBlur = this.handleOnBlur.bind(this)
  }

  handleOnInput (e) {

  }

  handleOnBlur (e) {
    this.props.handleLabelChange(
      this.props.labelKey,
      e.target.innerHTML.replace(/(<([^>]+)>)/ig, '')
    )
  }

  render() {
    const extraProps = {}

    if (this.props.mode === 'builder') {
      extraProps.contentEditable = true  
    }

    return (
      <div
        className={ this.props.className }
        onInput={ this.handleOnInput }
        onBlur={ this.handleOnBlur }
        { ...extraProps }
      >
        { this.props.value }
      </div>
    )
  }
}
