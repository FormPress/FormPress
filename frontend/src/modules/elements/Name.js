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
    options: ['Mr.'],
    prefixOptions: {
      default: ['Mr.'],
      formProps: {
        type: 'TextArea',
        label: 'Enter Prefix Options'
      }
    },
    prefix: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Allow users to enter a title before their names.']
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
        .map(([v, t]) => `${t}`)
        .join(' ')
    } else {
      return '-'
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
            <select
              id={`prefix_${config.id}`}
              name={`prefix_${config.id}`}
              defaultValue="choose-disabled">
              <option disabled value="choose-disabled">
                Prefix
              </option>
              {options.map((item) => {
                return (
                  <option className="option-space" key={item} value={item}>
                    {item}
                  </option>
                )
              })}
            </select>
            <div className="clearfix">
              <EditableLabel
                className="sublabel"
                data-placeholder="Type a sublabel"
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
                data-placeholder="Type a sublabel"
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
                data-placeholder="Type a sublabel"
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
                data-placeholder="Type a sublabel"
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
                data-placeholder="Type a sublabel"
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
            data-placeholder="Type a sublabel"
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
