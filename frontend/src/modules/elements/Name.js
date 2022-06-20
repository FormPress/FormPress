import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import { faAddressCard } from '@fortawesome/free-solid-svg-icons'

import './Name.css'

export default class Name extends Component {
  static weight = 8

  static defaultConfig = {
    id: 0,
    type: 'Name',
    label: 'Full Name',
    options: ['Mr.', 'Mrs.']
  }

  static metaData = {
    icon: faAddressCard,
    displayText: 'Name'
  }

  static submissionHandler = {
    getQuestionValue: (inputs, qid) => {
      let valueObject = {}
      for (const elem of inputs) {
        if (elem.q_id === qid) {
          valueObject[elem.sub_id] = elem.value
        }
      }
      return valueObject
    }
  }

  static configurableSettings = {
    prefix: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Allow users to enter a title before their names.']
      }
    },
    prefixTypeTextBox: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Change the type of title field to TextBox.']
      }
    },
    prefixOptions: {
      default: ['Mr.', 'Mrs.'],
      formProps: {
        type: 'TextArea',
        label: 'Preset Title Options'
      }
    },
    middleName: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Allow users to enter a middle name.']
      }
    },
    suffix: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Allow users to enter a title after their names.']
      }
    }
  }

  static renderDataValue(entry) {
    if (entry.value !== '') {
      return Object.entries(JSON.parse(entry.value))
        .map(([, t]) => `${t}`)
        .join(' ')
    } else {
      return '-'
    }
  }

  static helpers = {
    getElementValue: (id) => {
      const values = []

      const firstName = document.querySelector(`#fname_${id}`)
      const lastName = document.querySelector(`#lname_${id}`)
      const prefix = document.querySelector(`#prefix_${id}`)

      values.push(firstName, lastName)

      if (prefix.parentElement.classList.contains('hidden') === false) {
        values.push(prefix)
      }

      return values
    },
    isFilled: (value) => {
      return !value.some((item) => item.value.trim() === '')
    }
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value

      if (
        typeof config.value.default !== 'undefined' &&
        config.value.default !== null
      ) {
        inputProps.value = config.value.default.join('\n')
      }
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    const options =
      Array.isArray(config.options) === true ||
      typeof config.options !== 'undefined'
        ? config.options
        : ['']

    return (
      <ElementContainer type={config.type} {...this.props}>
        <EditableLabel
          className="fl label"
          mode={mode}
          labelKey={config.id}
          dataPlaceholder="Type a question"
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
            {typeof config.prefixTypeTextBox !== 'undefined' &&
            config.prefixTypeTextBox === true ? (
              <input
                id={`prefix_${config.id}`}
                name={`q_${config.id}[prefix]`}
                type="text"
              />
            ) : (
              <select
                id={`prefix_${config.id}`}
                name={`q_${config.id}[prefix]`}
                key={`q_${config.id}[prefix]`}
                defaultValue="">
                <option disabled value="">
                  Prefix
                </option>
                {options.map((item, index) => {
                  return (
                    <option
                      className="option-space"
                      key={item + '_' + index}
                      value={item}>
                      {item}
                    </option>
                  )
                })}
              </select>
            )}
            <div className="clearfix">
              <EditableLabel
                className="sublabel"
                dataPlaceholder="Click to edit sublabel"
                mode={mode}
                labelKey={`name_${config.id}_prefix`}
                handleLabelChange={this.props.handleLabelChange}
                value={
                  typeof config.prefixSublabelText !== 'undefined'
                    ? config.prefixSublabelText
                    : 'Prefix'
                }
              />
            </div>
          </span>
          <span className="name_span first_name">
            <input
              type="text"
              id={`fname_${config.id}`}
              name={`q_${config.id}[firstName]`}></input>
            <div className="clearfix">
              <EditableLabel
                className="sublabel"
                dataPlaceholder="Click to edit sublabel"
                mode={mode}
                labelKey={`name_${config.id}_firstName`}
                handleLabelChange={this.props.handleLabelChange}
                value={
                  typeof config.firstNameSublabelText !== 'undefined'
                    ? config.firstNameSublabelText
                    : 'First Name'
                }
              />
            </div>
          </span>
          <span
            className={`name_span middle_name${
              typeof config.middleName !== 'undefined' &&
              config.middleName === true
                ? ''
                : ' hidden'
            }`}>
            <input
              type="text"
              id={`mname_${config.id}`}
              name={`q_${config.id}[middleName]`}></input>
            <div className="clearfix">
              <EditableLabel
                className="sublabel"
                dataPlaceholder="Click to edit sublabel"
                mode={mode}
                labelKey={`name_${config.id}_middleName`}
                handleLabelChange={this.props.handleLabelChange}
                value={
                  typeof config.middleNameSublabelText !== 'undefined'
                    ? config.middleNameSublabelText
                    : 'Middle Name'
                }
              />
            </div>
          </span>
          <span className="name_span last_name">
            <input
              type="text"
              id={`lname_${config.id}`}
              name={`q_${config.id}[lastName]`}></input>
            <div className="clearfix">
              <EditableLabel
                className="sublabel"
                dataPlaceholder="Click to edit sublabel"
                mode={mode}
                labelKey={`name_${config.id}_lastName`}
                handleLabelChange={this.props.handleLabelChange}
                value={
                  typeof config.lastNameSublabelText !== 'undefined'
                    ? config.lastNameSublabelText
                    : 'Last Name'
                }
              />
            </div>
          </span>
          <span
            className={`suffix_span${
              typeof config.suffix !== 'undefined' && config.suffix === true
                ? ''
                : ' hidden'
            }`}>
            <input
              type="text"
              id={`suffix_${config.id}`}
              name={`q_${config.id}[suffix]`}></input>
            <div className="clearfix">
              <EditableLabel
                className="sublabel"
                dataPlaceholder="Click to edit sublabel"
                mode={mode}
                labelKey={`name_${config.id}_suffix`}
                handleLabelChange={this.props.handleLabelChange}
                value={
                  typeof config.suffixSublabelText !== 'undefined'
                    ? config.suffixSublabelText
                    : 'Suffix'
                }
              />
            </div>
          </span>
        </div>
        <div className="clearfix">
          <EditableLabel
            className="sublabel"
            dataPlaceholder="Click to edit sublabel"
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
        </div>
        <div className="fl metadata">
          <div className="requiredErrorText">{config.requiredText}</div>
        </div>
      </ElementContainer>
    )
  }
}
