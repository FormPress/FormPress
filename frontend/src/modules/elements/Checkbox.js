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
      const checkboxes = Array.from(nodeList)

      return checkboxes
    },
    isFilled: (value) => {
      return !value.every((item) => item.checked === false)
    }
  }

  static renderDataValue(entry, question) {
    return question.options.map((option, index) => {
      return (
        <div className="input" key={index}>
          <input
            type={question.type.toLowerCase()}
            id={'q_required_' + index}
            className={question.toggle === true ? 'toggle-checkbox' : ''}
            value={entry.value[index]}
            checked={entry.value.includes(index.toString())}
            disabled
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
        <div key="2" className={config.toggle === true ? 'toggle' : ''}>
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
            config.toggle === true ? 'checkboxCover toggle' : 'checkboxCover'
          }>
          {options.map((item, key) => {
            return (
              <div className="fl input" key={key}>
                <input
                  type="checkbox"
                  id={`q_${config.id}_${key}`}
                  name={`q_${config.id}`}
                  value={key}
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
