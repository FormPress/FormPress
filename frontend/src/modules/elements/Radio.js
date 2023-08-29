import React, { Component } from 'react'
import { cloneDeep } from 'lodash'
import EditableLabel from '../common/EditableLabel'
import EditableList from '../common/EditableList'
import ElementContainer from '../common/ElementContainer'
import { faDotCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons'

import './Radio.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class Radio extends Component {
  static weight = 3

  static defaultConfig = {
    id: 0,
    type: 'Radio',
    label: 'Single Choice',
    options: ['New Radio']
  }

  static metaData = {
    icon: faDotCircle,
    displayText: 'Single Choice',
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

  static getPlainStringValue(entry, question) {
    let plainString

    if (entry.value !== '') {
      plainString = question.options[parseInt(entry.value)]
    } else {
      plainString = '-'
    }

    // strip html tags in case of html input of rich text editor
    plainString = plainString.replace(/(<([^>]+)>)/gi, '')

    return plainString
  }

  static renderDataValue(entry, question) {
    return question.options.map((option, index) => {
      return (
        <div className="input" key={index}>
          <input
            type={question.type.toLowerCase()}
            id={'q_required_' + index}
            value={entry.value}
            defaultChecked={parseInt(entry.value) === index}
            disabled
            readOnly
          />
          <label
            className={question.type.toLowerCase() + '-label '}
            htmlFor={'q_required_' + index}
            dangerouslySetInnerHTML={{
              __html: option
            }}></label>
        </div>
      )
    })
  }

  static helpers = {
    getElementValue: (id) => {
      const nodeList = document.getElementsByName(`q_${id}`)
      const labels = document.querySelectorAll(`label[for^="q_${id}"]`)

      const values = []

      Array.from(nodeList).forEach((elem, index) => {
        values.push({
          index: elem.value,
          checked: elem.checked,
          value: labels[index].innerText
        })
      })

      return values
    },
    isFilled: (values) => {
      let filled = false
      values.forEach((elem) => {
        if (elem.checked) {
          filled = true
        }
      })
      return filled
    }
  }

  constructor(props) {
    super(props)

    this.handleAddingItem = this.handleAddingItem.bind(this)
    this.handleDeletingItem = this.handleDeletingItem.bind(this)
    this.config = props.config
    this.state = {
      isDetailOpen: false
    }
  }

  static configurableSettings = {
    editor: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Use rich text editor for question']
      }
    },
    editorForOptions: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Use rich text editor for options']
      }
    },
    isUnselectable: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Add a button to clear selection']
      }
    },
    unselectButtonText: {
      default: 'Clear Selection',
      isVisible: (config) => {
        return config.isUnselectable === true
      },
      formProps: {
        type: 'TextBox',
        label: 'Unselect Button Text',
        placeholder: 'Clear Selection'
      }
    },
    expectedAnswer: {
      default: '',
      isVisible: (config, form) => {
        let isFormInExamMode = false

        const foundSubmitBehaviour = form.props.integrations.find(
          (integration) => integration.type === 'submitBehaviour'
        )

        if (foundSubmitBehaviour) {
          isFormInExamMode = foundSubmitBehaviour.value === 'Evaluate Form'
        }

        return isFormInExamMode
      },
      formProps: {
        type: 'Dropdown',
        options: [{ value: 0, display: 'New Radio' }],
        label: 'Expected Answer',
        placeholder: 'None'
      }
    },
    answerExplanation: {
      default: '',
      isVisible: (config, form) => {
        let isFormInExamMode = false

        const foundSubmitBehaviour = form.props.integrations.find(
          (integration) => integration.type === 'submitBehaviour'
        )

        if (foundSubmitBehaviour) {
          isFormInExamMode = foundSubmitBehaviour.value === 'Evaluate Form'
        }

        return isFormInExamMode
      },
      formProps: {
        type: 'TextArea',
        editor: true,
        placeholder: 'Please enter an answer explanation',
        label: 'Answer Explanation'
      }
    }
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
    const { config, mode, selectedLabelId, selectedField } = this.props

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
        config.editor ? (
          <EditableLabel
            key="1"
            className="fl label"
            mode={mode}
            order={this.props.order}
            labelKey={config.id}
            editor={
              config.editor &&
              selectedField === config.id &&
              selectedLabelId === config.id
            }
            form_id={config.form_id}
            rteUploadHandler={this.props.rteUploadHandler}
            question_id={config.id}
            dataPlaceholder="Type a question"
            handleLabelChange={this.props.handleLabelChange}
            handleLabelClick={this.props.handleLabelClick}
            value={config.label}
            required={config.required}
            limit={2000}
          />
        ) : (
          <div className="elemLabelTitle" key={0}>
            <EditableLabel
              key="1"
              className="fl label"
              mode={mode}
              order={this.props.order}
              labelKey={config.id}
              editor={false}
              form_id={config.form_id}
              rteUploadHandler={this.props.rteUploadHandler}
              question_id={config.id}
              dataPlaceholder="Type a question"
              handleLabelChange={this.props.handleLabelChange}
              handleLabelClick={this.props.handleLabelClick}
              value={config.label}
              required={config.required}
              limit={2000}
            />
          </div>
        ),
        <div key="2" className="fl input">
          <EditableList
            config={config}
            mode={mode}
            rteUploadHandler={this.props.rteUploadHandler}
            editorForOptions={
              config.editorForOptions && selectedField === config.id
            }
            order={this.props.order}
            options={options}
            handleAddingItem={this.handleAddingItem}
            handleDeletingItem={this.handleDeletingItem}
            handleLabelChange={this.props.handleLabelChange}
            handleLabelClick={this.props.handleLabelClick}
            customBuilderHandlers={this.props.customBuilderHandlers}
            selectedLabelId={selectedLabelId}
          />
          {config.isUnselectable === true ? (
            <button
              type="button"
              className="unselect-button"
              id={`q_${config.id}_unselectButton`}>
              <EditableLabel
                className="sublabel unselect-label"
                dataPlaceholder="Clear Selection"
                mode={mode}
                labelKey={`radio_${config.id}_unselectButton`}
                handleLabelChange={this.props.handleLabelChange}
                value={
                  typeof config.unselectButtonText !== 'undefined'
                    ? config.unselectButtonText
                    : 'Clear Selection'
                }
              />
            </button>
          ) : null}
        </div>,
        <div className="clearfix" key="3">
          <EditableLabel
            className="sublabel"
            dataPlaceholder="Click to edit sublabel"
            mode={mode}
            labelKey={`sub_${config.id}`}
            handleLabelChange={this.props.handleLabelChange}
            handleLabelClick={this.props.handleLabelClick}
            value={
              typeof config.sublabelText !== 'undefined' &&
              config.sublabelText !== ''
                ? config.sublabelText
                : ''
            }
          />
        </div>,
        config.answerExplanation && config.answerExplanation !== '' ? (
          <div className="fl metadata answerExplanationContainer" key="4">
            <EditableLabel
              className="sublabel answerExplanationLabel"
              dataPlaceholder="Click to edit answer title"
              mode={mode}
              labelKey={`radio_${config.id}_answerLabel`}
              handleLabelChange={this.props.handleLabelChange}
              value={
                typeof config.answerLabelText !== 'undefined' &&
                config.answerLabelText !== ''
                  ? config.answerLabelText
                  : ''
              }
            />
            <details title={'Click to edit answer explanation'}>
              <summary>
                <span className="popover-container">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <div className="popoverText">
                    This part will not be displayed on the form.
                  </div>
                </span>
              </summary>
              <p
                dangerouslySetInnerHTML={{
                  __html: config.answerExplanation
                }}></p>
            </details>
          </div>
        ) : null
      ]
    } else {
      display = [
        config.editor ? (
          <EditableLabel
            key="1"
            className="fl label"
            mode={mode}
            order={this.props.order}
            labelKey={config.id}
            value={config.label}
            required={config.required}
            question_id={config.id}
          />
        ) : (
          <div className="elemLabelTitle" key={0}>
            <EditableLabel
              key="1"
              className="fl label"
              mode={mode}
              order={this.props.order}
              labelKey={config.id}
              value={config.label}
              required={config.required}
              question_id={config.id}
            />
          </div>
        ),
        <div key="2" className="fl input">
          <ul id={`q_${config.id}_radioList`} className="radioList">
            {config.options.map((item, key) => {
              return (
                <li key={key}>
                  <input
                    type="radio"
                    id={`q_${config.id}_${key}`}
                    name={`q_${config.id}`}
                    value={mode === 'renderer' ? key : item}
                    onChange={inputProps.onChange}
                    checked={config.value === item}></input>
                  <label
                    className="radio-label"
                    htmlFor={`q_${config.id}_${key}`}
                    dangerouslySetInnerHTML={{ __html: item }}></label>
                  <div className="check">
                    <div className="inside"></div>
                  </div>
                </li>
              )
            })}
          </ul>
          {config.isUnselectable === true ? (
            <button
              type="button"
              className="unselect-button"
              id={`q_${config.id}_unselectButton`}>
              <EditableLabel
                className="sublabel unselect-label"
                dataPlaceholder="Clear Selection"
                mode={mode}
                labelKey={`radio_${config.id}_unselectButton`}
                handleLabelChange={this.props.handleLabelChange}
                value={
                  typeof config.unselectButtonText !== 'undefined'
                    ? config.unselectButtonText
                    : 'Clear Selection'
                }
              />
            </button>
          ) : null}
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
        </div>,
        <div className="fl metadata answerExplanation dn" key="5">
          <details>
            <summary id={`q_${config.id}_answerLabel`}></summary>
            <div id={`q_${config.id}_answerExplanation`}></div>
          </details>
        </div>
      ]
    }

    if (mode === 'renderer' && config.isUnselectable) {
      let scriptInnerHtml = `
      ;(async () => {
       var elemContainer = document.getElementById('qc_${config.id}')
       var radioList = document.getElementById('q_${config.id}_radioList')
       var unselectButton = document.getElementById('q_${config.id}_unselectButton')
     
      radioList.onclick = function(e) {
       if (e.target.type === 'radio') {
        radioList.classList.add('dirty')
        }
      };
      
      unselectButton.onclick = function() {
      
        radioList.childNodes.forEach(function(item) {
          item.childNodes[0].checked = false;
        });
        
       if (FORMPRESS.requireds && ${config.id} in FORMPRESS.requireds) {
        FORMPRESS.requireds[${config.id}].valid = false;
        }
        
        radioList.classList.remove('dirty');
      }
      })()
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
