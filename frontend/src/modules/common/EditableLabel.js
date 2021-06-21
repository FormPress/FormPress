import React, { Component } from 'react'

export default class EditableLabel extends Component {
  constructor(props) {
    super(props)

    this.handleOnInput = this.handleOnInput.bind(this)
    this.handleOnBlur = this.handleOnBlur.bind(this)
    this.handleOnKeyDown = this.handleOnKeyDown.bind(this)
  }

  handleOnInput() {}

  handleOnBlur(e) {
    this.props.handleLabelChange(
      this.props.labelKey,
      e.target.innerHTML
        .replace(/<span(.*?)>(.*?)<\/span>/, '')
        .replace(/(<([^>]+)>)/gi, '')
        .trim()
    )
  }

  handleOnKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.target.blur()
    }
  }

  render() {
    const extraProps = {}

    if (this.props.mode === 'builder') {
      extraProps.contentEditable = true
    }

    return (
      <div className={this.props.className}>
        <span
          onInput={this.handleOnInput}
          onBlur={this.handleOnBlur}
          onKeyDown={this.handleOnKeyDown}
          suppressContentEditableWarning={true}
          {...extraProps}>
          {this.props.value}
        </span>
        {this.props.required === true ? (
          <span className="requiredMarker"> *</span>
        ) : null}
      </div>
    )
  }
}
