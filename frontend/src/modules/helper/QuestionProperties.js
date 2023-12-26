import React, { Component } from 'react'
import Renderer from '../Renderer'

import './QuestionProperties.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCode } from '@fortawesome/free-solid-svg-icons'

export default class QuestionProperties extends Component {
  constructor(props) {
    super(props)

    this.handleFieldChange = this.handleFieldChange.bind(this)
  }

  handleFieldChange(elem, e) {
    if (this.props.canEdit) {
      const value =
        typeof e === 'string'
          ? e
          : e.target.id === 'q_required' && e.target.value === true
          ? elem.value
          : e.target.type === 'checkbox'
          ? e.target.checked
          : e.target.value
      const elemId =
        typeof e === 'string'
          ? elem.id
          : e.target.id === 'q_required' && value === true
          ? elem.id.split('_')[1]
          : elem.id

      this.props.configureQuestion({
        id: this.props.selectedField.config.id,
        newState: {
          [elemId]: value
        }
      })
    }
  }

  render() {
    const { selectedField } = this.props

    const advancedSettingsList = ['customFieldId']

    if (typeof selectedField === 'undefined') {
      return null
    }

    const { configurableSettings, config } = selectedField
    const form = {
      props: {
        elements: []
      }
    }

    const advancedSettingsForm = {
      props: {
        elements: []
      }
    }

    const keys = Object.keys(configurableSettings)

    for (const key of keys) {
      const question = configurableSettings[key]

      if (
        question.isVisible !== undefined &&
        typeof question.isVisible === 'function'
      ) {
        if (question.isVisible(config, this.props.form) === false) {
          continue
        }
      }

      if (config[key] === undefined) {
        config[key] = question.default
      }

      if (advancedSettingsList.includes(key)) {
        advancedSettingsForm.props.elements.push(
          Object.assign({ id: key }, question.formProps, {
            value: config[key]
          })
        )
        continue
      }

      if (key === 'answerExplanation') {
        question.formProps.form_id = config.id
        form.props.elements.push(
          Object.assign({ id: key }, question.formProps, {
            value: config[key]
          })
        )
      } else {
        form.props.elements.push(
          Object.assign({ id: key }, question.formProps, {
            value: config[key]
          })
        )
      }
    }

    return (
      <div className="questionProperties">
        <div className="questionPropertiesMessage">
          Here you can change the question properties to your liking.
        </div>
        <div className="wrapper-questionProperties">
          <div className="question-info">
            <div
              className="qlabel"
              dangerouslySetInnerHTML={{
                __html: config?.label
                  ? config.label
                      .replace(/<span(.*?)>(.*?)<\/span>/, '')
                      .replace(/(<([^>]+)>)/gi, '')
                      .trim()
                  : ''
              }}></div>
            <div className="question_meta">
              <div className="qtype">
                Type: <span>{selectedField.config.type}</span>
              </div>
              <div className="qfieldid">
                Field ID: <span>{`q_` + selectedField.config.id}</span>
              </div>
              {selectedField.config?.customFieldId !== '' &&
              selectedField.config?.customFieldId !== undefined ? (
                <div className="qcustomfieldid">
                  Custom Field ID:{' '}
                  <span>q_{selectedField.config.customFieldId}</span>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>

          <Renderer
            theme="infernal"
            className="questionPropertiesForm"
            selectedField={selectedField}
            rteUploadHandler={this.props.rteUploadHandler}
            handleFieldChange={this.handleFieldChange}
            handleAddingItem={this.handleAddingItem}
            handleDeletingItem={this.handleDeletingItem}
            form={form}
            allowInternal={true}
            customBuilderHandlers={this.props.customBuilderHandlers}
            handleLabelChange={this.props.handleLabelChange}
            handleLabelClick={this.props.handleLabelClick}
            configureQuestion={this.props.configureQuestion}
            selectedLabelId={this.props.selectedLabelId}
          />

          {advancedSettingsForm.props.elements.length > 0 ? (
            <details
              className="adv-settings element"
              title="This part contains advanced settings. Some settings may cause your form to stop working properly.">
              <summary className="adv-settings-summary">
                <FontAwesomeIcon className="adv-settings-icon" icon={faCode} />
                &nbsp; Advanced settings
              </summary>
              <div className="adv-settings-row">
                <Renderer
                  theme="infernal"
                  className="questionPropertiesAdvancedForm"
                  selectedField={selectedField}
                  rteUploadHandler={this.props.rteUploadHandler}
                  handleFieldChange={this.handleFieldChange}
                  handleAddingItem={this.handleAddingItem}
                  handleDeletingItem={this.handleDeletingItem}
                  form={advancedSettingsForm}
                  allowInternal={true}
                  customBuilderHandlers={this.props.customBuilderHandlers}
                  handleLabelChange={this.props.handleLabelChange}
                  handleLabelClick={this.props.handleLabelClick}
                  configureQuestion={this.props.configureQuestion}
                  selectedLabelId={this.props.selectedLabelId}
                />
              </div>
            </details>
          ) : (
            ''
          )}
        </div>
      </div>
    )
  }
}
