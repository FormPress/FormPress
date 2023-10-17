import React, { Component } from 'react'

import { cloneDeep } from 'lodash'
import EditableLabel from '../common/EditableLabel'
import EditableList from '../common/EditableList'
import ElementContainer from '../common/ElementContainer'
import { faListCheck } from '@fortawesome/free-solid-svg-icons'

import './Checkbox.css'

export default class Checkbox extends Component {
  static weight = 4

  static defaultConfig = {
    id: 0,
    type: 'Checkbox',
    label: 'Multiple Choice',
    options: ['New Checkbox']
  }

  static metaData = {
    icon: faListCheck,
    displayText: 'Multiple Choice',
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

      if (!Array.isArray(value)) {
        value = [value]
      }

      return value
    }
  }

  static configurableSettings = {
    toggle: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Make this field toggle']
      }
    }
  }

  static helpers = {
    getElementValue: (id) => {
      const nodeList = document.getElementsByName(`q_${id}`)
      const labels = document.querySelectorAll(`label[for^="q_${id}"]`)

      const options = Array.from(nodeList).map((elem, index) => {
        return {
          index: elem.value,
          checked: elem.checked,
          value: labels[index].innerText
        }
      })

      return options
    },
    isFilled: (value) => {
      return !value.every((item) => item.checked === false)
    }
  }

  static getPlainStringValue(entry, question) {
    let plainString = ''

    if (entry.value.length > 0) {
      plainString = entry.value
        .map((value) => question.options[value])
        .join(', ')
    } else {
      plainString = '-'
    }

    return plainString
  }

  static renderDataValue(entry, question) {
    return question.options.map((option, index) => {
      let checkedAnswers
      // if entry is not an array make it one
      if (!Array.isArray(entry.value)) {
        checkedAnswers = [entry.value.toString()]
      } else {
        checkedAnswers = entry.value
      }

      return (
        <div className="input" key={index}>
          <input
            type={question.type.toLowerCase()}
            id={'q_required_' + index}
            className={question.toggle === true ? 'toggle-checkbox' : ''}
            value={index}
            checked={checkedAnswers.includes(index.toString())}
            readOnly
          />
          {question.toggle === true ? <span className="slider"></span> : null}
          <label
            className={
              question.type.toLowerCase() +
              '-label ' +
              (question.toggle === true ? 'toggle-label' : '')
            }
            htmlFor={'q_required_' + index}>
            {option}
          </label>
        </div>
      )
    })
  }

  constructor(props) {
    super(props)

    this.handleAddingItem = this.handleAddingItem.bind(this)
    this.handleDeletingItem = this.handleDeletingItem.bind(this)
  }

  handleAddingItem(id) {
    const { config } = this.props
    if (typeof config.options === 'undefined') {
      config.options = [`New ${config.type}`]
    }

    const newOptions = cloneDeep(config.options)
    newOptions.push(`New ${config.type}`)

    this.props.configureQuestion({
      id: id,
      newState: {
        options: newOptions
      }
    })
  }

  handleDeletingItem(id) {
    const { config } = this.props
    const options = config.options
    const newOptions = options.filter((option, index) => index !== id)

    this.props.configureQuestion({
      id: config.id,
      newState: {
        options: newOptions
      }
    })
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof config.value !== 'undefined' && !Array.isArray(config.value)) {
      inputProps.checked = config.value === true
    }

    if (typeof config.disabled !== 'undefined') {
      inputProps.disabled = config.disabled
    }

    if (config.defaultChecked !== undefined) {
      inputProps.defaultChecked = config.defaultChecked
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    const options =
      Array.isArray(config.options) === true ||
      typeof config.options !== 'undefined'
        ? config.options
        : ['']

    let display
    if (mode === 'builder') {
      display = [
        <div className="elemLabelTitle" key={0}>
          <EditableLabel
            key="1"
            className="fl label"
            mode={mode}
            labelKey={config.id}
            handleLabelChange={this.props.handleLabelChange}
            value={config.label}
            dataPlaceholder="Type a question"
            required={config.required}
          />
        </div>,
        <div
          key="2"
          className={config.toggle === true ? 'input toggle' : 'input'}>
          <EditableList
            config={config}
            mode={mode}
            options={options}
            handleAddingItem={this.handleAddingItem}
            handleDeletingItem={this.handleDeletingItem}
            handleLabelChange={this.props.handleLabelChange}
            customBuilderHandlers={this.props.customBuilderHandlers}
          />
        </div>
      ]
    } else {
      display = [
        <div
          className={`elemLabelTitle ${config.label ? '' : ' emptyLabel'}`}
          key={0}>
          <EditableLabel
            key="1"
            className="fl label"
            mode={mode}
            labelKey={config.id}
            dataPlaceholder="Type a question"
            handleLabelChange={this.props.handleLabelChange}
            value={config.label}
            required={config.required}
          />
        </div>,
        <div
          key="2"
          className={
            config.toggle === true
              ? 'input checkboxCover toggle'
              : 'input checkboxCover'
          }>
          {options.map((item, key) => {
            const keySpecificProps = {}

            if (inputProps.defaultChecked !== undefined) {
              if (typeof inputProps.defaultChecked === 'boolean') {
                keySpecificProps.defaultChecked = inputProps.defaultChecked
              } else {
                keySpecificProps.defaultChecked = inputProps.defaultChecked.includes(
                  key
                )
              }
            }

            if (config.value !== undefined) {
              if (typeof config.value === 'boolean') {
                keySpecificProps.checked = config.value
              } else {
                keySpecificProps.checked = config.value.includes(key)
              }
            }

            return (
              <div className="fl input" key={key}>
                <input
                  type="checkbox"
                  id={`q_${config.id}_${key}`}
                  name={`q_${config.id}`}
                  value={key}
                  {...keySpecificProps}
                  {...inputProps}
                />
                {config.toggle === true ? <span className="slider"></span> : ''}
                <label
                  className="checkbox-label"
                  htmlFor={`q_${config.id}_${key}`}>
                  {item}
                </label>
              </div>
            )
          })}
        </div>
      ]
    }
    return (
      <ElementContainer type={config.type} {...this.props}>
        {display}
        {mode === 'viewer' ? (
          ''
        ) : (
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
        )}
        <div className="fl metadata">
          <div className="requiredErrorText">{config.requiredText}</div>
        </div>
      </ElementContainer>
    )
  }
}
