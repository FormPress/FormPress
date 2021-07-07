import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import './Name.css'

export default class Name extends Component {
  static weight = 7

  static defaultConfig = {
    id: 0,
    type: 'Name',
    label: 'Full Name',
    sublabelText: '',
    middleName: false,
    suffix: false,
    prefix: false
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
        <div className="nameContainer">
          <span
            className={`prefix_span${
              typeof config.prefix !== 'undefined' && config.prefix === true
                ? ''
                : ' hidden'
            }`}>
            <select name="prefix">
              <option>Prefix</option>
              <option>Mr.</option>
              <option>Mrs.</option>
            </select>
          </span>
          <span className="name_span">
            <input
              type="text"
              id="fname"
              name={`q_${config.id}[firstName]`}></input>
          </span>
          <span
            className={`name_span${
              typeof config.middleName !== 'undefined' &&
              config.middleName === true
                ? ''
                : ' hidden'
            }`}>
            <input
              type="text"
              id="mname"
              name={`q_${config.id}[middleName]`}></input>
          </span>
          <span className="name_span">
            <input
              type="text"
              id="lname"
              name={`q_${config.id}[lastName]`}></input>
          </span>
          <span
            className={`suffix_span${
              typeof config.suffix !== 'undefined' && config.suffix === true
                ? ''
                : ' hidden'
            }`}>
            <input
              type="text"
              id="suffix"
              name={`q_${config.id}[suffix]`}></input>
          </span>
        </div>
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
