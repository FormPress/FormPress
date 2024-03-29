import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import { faPhone } from '@fortawesome/free-solid-svg-icons'

import './Phone.css'

export default class Phone extends Component {
  constructor(props) {
    super(props)
    this.state = {
      datasets: {}
    }
  }

  componentDidMount() {
    fetch(
      `${
        process.env.FE_BACKEND || global.env.FE_BACKEND
      }/api/datasets?dataset=countriesDialCodes`
    )
      .then((response) => {
        return response.json()
      })
      .then((response) => {
        this.setState({
          datasets: response
        })
      })
  }
  static weight = 12

  static defaultConfig = {
    id: 0,
    type: 'Phone',
    label: 'Phone',
    hasDataset: true
  }

  static metaData = {
    icon: faPhone,
    displayText: 'Phone',
    group: 'inputElement'
  }

  static submissionHandler = {
    findQuestionValue: (inputs, qid) => {
      let value = ''
      for (const elem of inputs) {
        if (elem.q_id === qid) {
          value = elem.value
        }
      }
      return value
    }
  }

  static getPlainStringValue(entry) {
    let plainString

    if (entry.value !== '') {
      plainString = entry.value
    } else {
      plainString = '-'
    }

    return plainString
  }

  static renderDataValue(entry) {
    return entry.value ? entry.value : '-'
  }

  static helpers = {
    getElementValue: 'defaultInputHelpers',
    isFilled: (value) => {
      return value.trim().length > 6
    }
  }

  static configurableSettings = {
    defaultDialCode: {
      default: '+1 (US)',
      formProps: {
        type: 'Dropdown',
        label: 'Default country',
        hasDataset: true,
        dataset: 'countriesDialCodes'
      }
    }
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}
    const { datasets } = this.state

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    if (typeof config.placeholder !== 'undefined') {
      inputProps.placeholder = config.placeholder
    }

    if (typeof config.maxLength !== 'undefined') {
      inputProps.maxLength = config.maxLength
    }

    if (
      typeof config.customFieldId !== 'undefined' &&
      config.customFieldId !== ''
    ) {
      inputProps['data-fp-custom-field-id'] = 'q_' + config.customFieldId
    }

    let display

    display = [
      <div className="elemLabelTitle" key={0}>
        <EditableLabel
          className="fl label"
          dataPlaceholder="Type a question"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
          key="1"
        />
      </div>,
      <div className="fl input" key="2">
        <select
          className="dialCode"
          id={`phone-dialCode_${config.id}`}
          defaultValue={
            config.defaultDialCode ? config.defaultDialCode : '+1 (US)'
          }
          data-fp-list={'countriesDialCodes'}
          data-fp-defaultvalue={config.defaultDialCode}
          disabled={mode !== 'renderer'}>
          {datasets && datasets.countriesDialCodes
            ? datasets.countriesDialCodes.map((country, index) => {
                return (
                  <option key={index} value={country.value}>
                    {country.display}
                  </option>
                )
              })
            : null}
        </select>
        <input
          id={`q_${config.id}`}
          className="phoneInput"
          name={`q_${config.id}`}
          maxLength={30}
          value={
            config.defaultDialCode
              ? config.defaultDialCode.substring(
                  0,
                  config.defaultDialCode.length - 4
                )
              : // to remove the part with the country code
                ''
          }
          readOnly={mode !== 'renderer'}
          {...inputProps}
        />
      </div>,
      <div className="clearfix" key="3">
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
      </div>,
      <div className="fl metadata" key="4">
        <div className="requiredErrorText">{config.requiredText}</div>
      </div>
    ]

    if (mode === 'renderer') {
      let scriptInnerHtml = `
      document.getElementById('phone-dialCode_${config.id}').addEventListener('change', function () {
        var dialCode = this.value
        dialCode = dialCode.substring(0, dialCode.length - 4)
        var phoneNumberInput = this.nextElementSibling
        phoneNumberInput.value = dialCode
      })
    
      document.getElementById('q_${config.id}').addEventListener('keypress', function (e) {
        var key = e.which || e.keyCode
        var regex = /^[0-9 ()+-]+$/
        if (!regex.test(String.fromCharCode(key))) {
          e.preventDefault()
        }
      })
  `
      let script = (
        <script key={5} dangerouslySetInnerHTML={{ __html: scriptInnerHtml }} />
      )
      display.push(script)
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        {display}
      </ElementContainer>
    )
  }
}
