import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

import './Dropdown.css'
const BACKEND = process.env.REACT_APP_BACKEND

export default class Dropdown extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataset: [],
      datasetName: ''
    }
  }

  componentDidMount() {
    const { config } = this.props
    if (config.hasDataset === true) {
      this.populateDropdownWithDataset(config.dataset)
    }
  }

  componentDidUpdate() {
    const { config } = this.props
    if (config.hasDataset === true) {
      this.populateDropdownWithDataset(config.dataset)
    } else {
      if (this.state.dataset.length !== 0) {
        this.setState({ dataset: [], datasetName: '' })
      }
    }
  }

  populateDropdownWithDataset = (requestedDataset) => {
    if (this.state.datasetName !== requestedDataset) {
      fetch(`${BACKEND}/api/datasets?dataset=${requestedDataset}`)
        .then((response) => {
          return response.json()
        })
        .then((response) => {
          this.setState({
            dataset: response[requestedDataset],
            datasetName: requestedDataset
          })
        })
    }
  }

  static weight = 5

  static defaultConfig = {
    id: 0,
    type: 'Dropdown',
    label: 'Dropdown',
    options: ['Dropdown 1', 'Dropdown 2'],
    placeholder: '',
    dropdownOptions: {
      default: ['Dropdown 1', 'Dropdown 2'],
      formProps: {
        type: 'TextArea',
        label: 'Dropdown options'
      }
    }
  }

  static renderDataValue(entry) {
    return entry.value
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

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    const options =
      Array.isArray(config.options) === true ||
      typeof config.options !== 'undefined'
        ? config.options
        : ['']

    var display
    if (mode === 'builder') {
      display = [
        <EditableLabel
          key="1"
          className="fl label"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          dataPlaceholder="Type a question"
          value={config.label}
          required={config.required}
        />,
        <div key="2">
          {
            <div className="dropdown-div">
              <select
                className="dropdown-select"
                id={`q_${config.id}`}
                name={`q_${config.id}`}
                defaultValue="choose-disabled"
                onChange={inputProps.onChange}
                data-fp-list={config.hasDataset ? config.dataset : null}>
                {config.placeholder ? (
                  <option disabled value="choose-disabled">
                    {config.placeholder}
                  </option>
                ) : null}
                {this.state.dataset && this.state.dataset.length > 0
                  ? this.state.dataset.map((item) => {
                      return (
                        <option
                          className="option-space"
                          key={item}
                          value={item}>
                          {item}
                        </option>
                      )
                    })
                  : options.map((item) => {
                      return (
                        <option
                          className="option-space"
                          key={item}
                          value={item}>
                          {item}
                        </option>
                      )
                    })}
              </select>
            </div>
          }
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
        <EditableLabel
          key="1"
          className="fl label"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />,
        <div key="2" className="dropdown-div">
          <select
            className="dropdown-select"
            id={`q_${config.id}`}
            name={`q_${config.id}`}
            defaultValue={config.value ? config.value : 'choose-disabled'}
            onChange={inputProps.onChange}
            data-fp-list={config.hasDataset ? config.dataset : null}>
            {config.placeholder ? (
              <option disabled value="choose-disabled">
                {config.placeholder}
              </option>
            ) : null}
            {config.hasDataset
              ? null
              : config.id === 'dataset'
              ? options.map((item) => {
                  return (
                    <option
                      className="option-space"
                      key={item.value}
                      value={item.value}
                      disabled={item.disabled}>
                      {item.displayText}
                    </option>
                  )
                })
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
