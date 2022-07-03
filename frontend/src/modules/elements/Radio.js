import React, { Component } from 'react'
import { cloneDeep } from 'lodash'

import EditableLabel from '../common/EditableLabel'
import EditableList from '../common/EditableList'
import ElementContainer from '../common/ElementContainer'

import './Radio.css'

export default class Radio extends Component {
  static weight = 6

  static defaultConfig = {
    id: 0,
    type: 'Radio',
    label: 'Radio',
    options: ['New Radio']
  }

  static IsJsonString(str) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }

  static dataContentOrganizer(dataContentValue, element) {
    const tempContentValue = cloneDeep(dataContentValue)
    let returnContent = []

    if (this.IsJsonString(tempContentValue) === false) {
      for (let elementContent of element.options) {
        if (tempContentValue === elementContent) {
          returnContent.push({
            content: elementContent,
            value: 'checked',
            type: element.type,
            toggle: element.toggle
          })
        } else {
          returnContent.push({
            content: elementContent,
            value: '',
            type: element.type,
            toggle: element.toggle
          })
        }
      }
    } else {
      for (let elementContent of element.options) {
        if (tempContentValue.includes(elementContent) === true) {
          returnContent.push({
            content: elementContent,
            value: 'checked',
            type: element.type,
            toggle: element.toggle
          })
        } else {
          returnContent.push({
            content: elementContent,
            value: '',
            type: element.type,
            toggle: element.toggle
          })
        }
      }
    }

    return returnContent
  }

  static renderDataValue(entry) {
    return entry.value.map((input, index) => {
      return (
        <div className="input" key={index}>
          <input
            type={input.type.toLowerCase()}
            id={'q_required_' + index}
            className={input.toggle === true ? 'toggle-checkbox' : ''}
            defaultChecked={input.value}
            disabled
            readOnly
          />
          {input.toggle === true ? <span className="slider"></span> : null}
          <label
            className={
              input.type.toLowerCase() +
              '-label ' +
              (input.toggle === true ? 'toggle-label' : '')
            }
            htmlFor={'q_required_' + index}>
            {input.content}
          </label>
        </div>
      )
    })
  }

  static helpers = {
    getElementValue: (id) => {
      const nodeList = document.getElementsByName(`q_${id}`)
      const radioButtons = Array.from(nodeList)

      return radioButtons
    },
    isFilled: (value) => {
      return !value.every((item) => item.checked === false)
    }
  }

  static configurableSettings = {
    editor: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Use rich text editor']
      }
    },
    correctAnswer: {
      default: '',
      formProps: {
        type: 'TextArea',
        editor: true,
        label: 'Correct Answer'
      }
    }
  }

  constructor(props) {
    super(props)

    this.handleAddingItem = this.handleAddingItem.bind(this)
    this.handleDeletingItem = this.handleDeletingItem.bind(this)
  }

  handleAddingItem() {
    const { config } = this.props
    if (typeof config.options === 'undefined') {
      config.options = [`New ${config.type}`]
    }

    const newOptions = cloneDeep(config.options)
    newOptions.push(`New ${config.type}`)

    this.props.configureQuestion({
      id: config.id,
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

    const options =
      Array.isArray(config.options) === true ||
      typeof config.options !== 'undefined'
        ? config.options
        : ['']

    const inputProps = {}

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    var display
    if (mode === 'builder') {
      display = [
        <EditableLabel
          key="1"
          className="fl label"
          mode={mode}
          labelKey={config.id}
          editor={config.editor}
          form_id={config.form_id}
          question_id={config.id}
          dataPlaceholder="Type a question"
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />,
        <div key="2" className="fl input">
          <EditableList
            config={config}
            mode={mode}
            options={options}
            handleAddingItem={this.handleAddingItem}
            handleDeletingItem={this.handleDeletingItem}
            handleLabelChange={this.props.handleLabelChange}
            customBuilderHandlers={this.props.customBuilderHandlers}
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
        </div>
      ]
    } else {
      display = [
        <div
          key="1"
          className="fl label"
          dangerouslySetInnerHTML={{
            __html: config.label
          }}></div>,
        <div key="2" className="fl input">
          <ul>
            {config.options.map((item, key) => {
              return (
                <li key={key}>
                  <input
                    type="radio"
                    id={`q_${config.id}_${key}`}
                    name={`q_${config.id}`}
                    value={item}
                    onChange={inputProps.onChange}
                    defaultChecked={config.value === item}></input>
                  <label
                    className="radio-label"
                    htmlFor={`q_${config.id}_${key}`}>
                    {item}
                  </label>
                  <div className="check">
                    <div className="inside"></div>
                  </div>
                </li>
              )
            })}
          </ul>
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
