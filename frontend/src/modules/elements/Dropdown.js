import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import { faSort } from '@fortawesome/free-solid-svg-icons'

import './Dropdown.css'

export default class Dropdown extends Component {
  constructor(props) {
    super(props)
    this.state = {
      datasets: []
    }
  }

  componentDidMount() {
    const { config } = this.props
    if (config.hasDataset === true) {
      this.populateDropdownWithDataset(config.dataset)
    }
  }

  componentDidUpdate() {
    const availableDatasets = this.state.datasets
    const { config } = this.props

    if (
      config.hasDataset === true &&
      availableDatasets[config.dataset] === undefined
    ) {
      this.populateDropdownWithDataset(config.dataset)
    }
  }

  populateDropdownWithDataset = (requestedDataset) => {
    const availableDatasets = this.state.datasets

    fetch(
      `${
        process.env.FE_BACKEND || global.env.FE_BACKEND
      }/api/datasets?dataset=${requestedDataset}`
    )
      .then((response) => {
        return response.json()
      })
      .then((response) => {
        availableDatasets[requestedDataset] = response[requestedDataset]
        this.setState({
          datasets: availableDatasets
        })
      })
  }

  static weight = 5

  static defaultConfig = {
    id: 0,
    type: 'Dropdown',
    label: 'Drop-down List',
    options: ['Option 1', 'Option 2'],
    placeholder: 'Choose an option'
  }

  static metaData = {
    icon: faSort,
    displayText: 'Drop-down List',
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

  static configurableSettings = {
    dropdownOptions: {
      default: ['Option 1', 'Option 2'],
      isVisible: (config) => {
        return config.hasDataset === false
      },
      formProps: {
        type: 'List',
        label: 'Drop-down Options',
        options: ['Option 1', 'Option 2']
      }
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
    isFilled: 'defaultInputHelpers'
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof config.value !== 'undefined') {
      inputProps.checked = config.value === true
    }

    if (typeof config.defaultValue !== 'undefined') {
      inputProps.defaultValue = config.defaultValue
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    if (config.hasDataset === true) {
      inputProps['data-fp-list'] = config.dataset
    }

    if (
      typeof config.customFieldId !== 'undefined' &&
      config.customFieldId !== ''
    ) {
      inputProps['data-fp-custom-field-id'] = 'q_' + config.customFieldId
    }

    let options =
      Array.isArray(config.options) === true ||
      typeof config.options !== 'undefined'
        ? config.options
        : ['']

    if (config.id === 'expectedAnswer') {
      const selectedFieldConfig = this.props.selectedField.config
      options = selectedFieldConfig.options.map((option, index) => {
        return {
          value: index,
          display: option.replace(/<(?:.|\n)*?>/gm, '')
        }
      })
    }

    var display
    if (mode === 'builder' || mode === 'viewer') {
      display = [
        <div className="elemLabelTitle" key={0}>
          <EditableLabel
            key="1"
            className="fl label"
            mode={mode}
            labelKey={config.id}
            handleLabelChange={this.props.handleLabelChange}
            dataPlaceholder="Type a question"
            value={config.label}
            required={config.required}
          />
        </div>,
        <div key={1} className="dropdown-div input">
          {!config.hasDataset && config.options === undefined ? null : (
            <select
              className="dropdown-select"
              id={`q_${config.id}`}
              name={`q_${config.id}`}
              value={mode === 'viewer' ? config.value : undefined}
              {...inputProps}>
              {config.placeholder !== false ? (
                <option
                  disabled={config.id !== 'expectedAnswer'}
                  defaultValue
                  value="">
                  {config.placeholder}
                </option>
              ) : null}
              {config.hasDataset && this.state.datasets[config.dataset]
                ? this.state.datasets[config.dataset].map((item, index) => {
                    return (
                      <option
                        className="option-space"
                        key={`dropdown_${config.id}_` + index}
                        value={item.value}>
                        {item.display}
                      </option>
                    )
                  })
                : typeof options[0] === 'object'
                  ? options.map((item, index) => {
                      return (
                        <option
                          className="option-space"
                          key={`dropdown_${config.id}_` + index}
                          value={item.value}
                          disabled={item.disabled}
                          dangerouslySetInnerHTML={{
                            __html: item.display
                          }}></option>
                      )
                    })
                  : options.map((item, index) => {
                      return (
                        <option
                          className="option-space"
                          key={`dropdown_${config.id}_` + index}
                          value={item}>
                          {item}
                        </option>
                      )
                    })}
            </select>
          )}
        </div>,
        <div className="clearfix" key="3">
          <EditableLabel
            className="sublabel"
            mode={mode}
            dataPlaceholder="Click to edit sublabel"
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
      ]
    } else {
      display = [
        <div className="elemLabelTitle" key={0}>
          <EditableLabel
            key="1"
            className="fl label"
            mode={mode}
            labelKey={config.id}
            handleLabelChange={this.props.handleLabelChange}
            value={config.label}
            required={config.required}
          />
        </div>,
        <div key="2" className="dropdown-div input">
          <select
            className="dropdown-select"
            id={`q_${config.id}`}
            name={`q_${config.id}`}
            defaultValue={config.value ? config.value : ''}
            {...inputProps}>
            {config.placeholder !== false ? (
              <option disabled value="">
                {config.placeholder}
              </option>
            ) : null}
            {config.hasDataset
              ? null
              : options.map((item) => {
                  return (
                    <option className="option-space" key={item} value={item}>
                      {item}
                    </option>
                  )
                })}
          </select>
        </div>,
        <div className="clearfix" key="3">
          <EditableLabel
            className="sublabel"
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
        <div key="4" className="fl metadata">
          <div className="requiredErrorText">{config.requiredText}</div>
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
