import React, { Component } from 'react'
import _ from 'lodash'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons'

import './DatePicker.css'

export default class DatePicker extends Component {
  static weight = 12

  constructor(props) {
    super(props)

    this.state = {
      isDateSupported: true,
      input: '',
      flatpickrModule: null,
      flatpickrOptions: this.getFlatpickrOptions(),
      date: new Date(),
      key:
        props.config.id +
        '_' +
        Math.floor(Math.random() * 16777215).toString(16)
    }
  }
  componentDidMount() {
    const input =
      typeof document !== 'undefined' ? document.createElement('input') : null

    if (input) {
      input.setAttribute('type', 'date')
    }

    this.setState({
      isDateSupported: input ? input.type !== 'text' : false,
      input: input
    })

    if (input) {
      input.remove()
    }

    if (!this.state.isDateSupported) {
      import('flatpickr/dist/flatpickr.css')
        .then(() => import('react-flatpickr'))
        .then((react_flatpickr) => {
          react_flatpickr &&
            this.setState({
              flatpickrModule: react_flatpickr.default
            })
        })
    }
  }

  componentDidUpdate() {
    if (!_.isEqual(this.getFlatpickrOptions(), this.state.flatpickrOptions)) {
      this.setState({ flatpickrOptions: this.getFlatpickrOptions() }, () => {
        this.recreateInstance()
      })
    }
  }

  static configurableSettings = {
    timePicker: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Allow users to enter time input.']
      }
    }
  }

  static defaultConfig = {
    id: 0,
    type: 'DatePicker',
    label: 'DatePicker'
  }

  static metaData = {
    icon: faCalendarDays,
    displayText: 'DatePicker',
    group: 'inputElement'
  }

  static submissionHandler = {
    findQuestionValue: (inputs, qid) => {
      let valueObject = {}
      for (const elem of inputs) {
        if (elem.q_id === qid) {
          valueObject[elem.sub_id] = elem.value
        }
      }
      return valueObject
    }
  }

  static getPlainStringValue(entry) {
    let plainString
    if (entry.value !== '') {
      plainString = Object.entries(entry.value)
        .map(([, t]) => `${t}`)
        .filter((text) => text.trim() !== '')
        .join(' ')
    } else {
      plainString = '-'
    }
    return plainString
  }

  static renderDataValue(entry, question) {
    return (
      Object.entries(entry.value).map((entry) => {
        const key = entry[0]
        const value = entry[1]

        if (key === 'time' && !question.timePicker) {
          return null
        }

        let defaultSublabel = true

        if (question[`${key}SublabelText`]) {
          defaultSublabel = false
        }

        return (
          <div key={key}>
            <strong
              style={defaultSublabel ? { textTransform: 'capitalize' } : null}>
              {defaultSublabel
                ? key.replace(/([a-z])([A-Z])/g, '$1 $2')
                : question[`${key}SublabelText`]}
              :
            </strong>
            {' ' + value}
            <br />
          </div>
        )
      }) || '-'
    )
  }

  static helpers = {
    getElementValue: (id) => {
      const values = []

      const date = document.querySelector(`#date_${id}`)
      const time = document.querySelector(`#time_${id}`)

      values.push({ type: 'date', value: date.value })

      if (time && time.parentElement.classList.contains('hidden') === false) {
        values.push({ type: 'time', value: time.value })
      }

      return values
    },
    isFilled: (values) => {
      return values.every((value) => value.value !== '')
    }
  }

  getFlatpickrOptions() {
    return typeof this.props.config.timePicker !== 'undefined' &&
      this.props.config.timePicker === true
      ? {
          enableTime: true,
          dateFormat: 'Y-m-d H:i',
          time_24hr: true
        }
      : {}
  }

  recreateInstance = () => {
    this.setState({
      key:
        this.props.config.id +
        '_' +
        Math.floor(Math.random() * 16777215).toString(16)
    })
  }

  findRelevantValue = (type, allValue) => {
    // it will either be a date, or a date and time divided by a space

    if (type === 'date') {
      return allValue.split(' ')[0]
    } else {
      return allValue.split(' ')[1] || ''
    }
  }

  render() {
    const { config, mode } = this.props
    const { isDateSupported, flatpickrModule, flatpickrOptions, key } =
      this.state

    const inputProps = {}
    let Flatpickr = null

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    if (typeof config.placeholder !== 'undefined') {
      inputProps.placeholder = config.placeholder
    }

    if (
      typeof config.customFieldId !== 'undefined' &&
      config.customFieldId !== ''
    ) {
      inputProps['data-fp-custom-field-id'] = 'q_' + config.customFieldId
    }

    if (!isDateSupported) {
      Flatpickr = flatpickrModule
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        <div className="elemLabelTitle">
          <EditableLabel
            className="fl label"
            mode={mode}
            labelKey={config.id}
            handleLabelChange={this.props.handleLabelChange}
            dataPlaceholder="Type a question"
            value={config.label}
            required={config.required}
          />
        </div>
        <div className="datePickerContainer">
          <span className="date_span">
            {isDateSupported ? (
              <input
                id={`date_${config.id}`}
                name={`q_${config.id}[date]`}
                type={'date'}
                value={
                  config.value
                    ? this.findRelevantValue('date', config.value)
                    : ''
                }
                readOnly={mode !== 'renderer'}
                {...inputProps}
              />
            ) : mode === 'builder' ? (
              Flatpickr !== null ? (
                <Flatpickr
                  key={key}
                  value={this.state.date}
                  onChange={(date) => this.setState({ date })}
                  options={flatpickrOptions}
                />
              ) : null
            ) : (
              <input
                id={`date_${config.id}`}
                name={`q_${config.id}[date]`}
                type={'text'}
                flatpickroptions={JSON.stringify(flatpickrOptions)}
                {...inputProps}
              />
            )}
            <div className="clearfix">
              <EditableLabel
                className="sublabel"
                dataPlaceholder="Click to edit sublabel"
                mode={mode}
                labelKey={`date_${config.id}_date`}
                handleLabelChange={this.props.handleLabelChange}
                value={
                  typeof config.dateSublabelText !== 'undefined' &&
                  config.dateSublabelText !== ''
                    ? config.dateSublabelText
                    : ''
                }
              />
            </div>
          </span>
          {isDateSupported ? (
            <span
              className={`time_span${
                typeof config.timePicker !== 'undefined' &&
                config.timePicker === true
                  ? ''
                  : ' hidden'
              }`}>
              <input
                id={`time_${config.id}`}
                name={`q_${config.id}[time]`}
                type={isDateSupported ? 'time' : 'text'}
                value={
                  config.value
                    ? this.findRelevantValue('time', config.value)
                    : ''
                }
                readOnly={mode !== 'renderer'}
                pattern={isDateSupported ? '[Hh]{2}:[Mm]{2}' : undefined}
                className={!isDateSupported ? 'flatpickr-time-needed' : ''}
                {...inputProps}
              />
              <div className="clearfix">
                <EditableLabel
                  className="sublabel"
                  dataPlaceholder="Click to edit sublabel"
                  mode={mode}
                  labelKey={`date_${config.id}_time`}
                  handleLabelChange={this.props.handleLabelChange}
                  value={
                    typeof config.timeSublabelText !== 'undefined'
                      ? config.timeSublabelText
                      : 'Time'
                  }
                />
              </div>
            </span>
          ) : null}
        </div>
        <div className="clearfix">
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
        <div className="fl metadata">
          <div className="requiredErrorText">{config.requiredText}</div>
        </div>
      </ElementContainer>
    )
  }
}
