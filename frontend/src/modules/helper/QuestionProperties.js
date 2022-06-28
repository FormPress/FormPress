import React, { Component } from 'react'
import Renderer from '../Renderer'

import './QuestionProperties.css'

export default class QuestionProperties extends Component {
  constructor(props) {
    super(props)

    this.handleFieldChange = this.handleFieldChange.bind(this)
  }

  handleFieldChange(elem, e) {
    const value =
      typeof e === 'string'
        ? e
        : e.target.id === 'q_required' && value === true
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

  render() {
    const { selectedField } = this.props

    if (typeof selectedField === 'undefined') {
      return null
    }

    const { configurableSettings, config } = selectedField
    const form = {
      props: {
        elements: []
      }
    }
    const keys = Object.keys(configurableSettings)

    for (const key of keys) {
      const question = configurableSettings[key]

      if (config[key] === undefined) {
        config[key] = question.default
      }

      form.props.elements.push(
        Object.assign({ id: key }, question.formProps, {
          value: config[key]
        })
      )
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
            <div className="qtype">{selectedField.config.type}</div>
          </div>

          <Renderer
            theme="infernal"
            className="questionPropertiesForm"
            selectedField={selectedField}
            handleFieldChange={this.handleFieldChange}
            handleAddingItem={this.handleAddingItem}
            handleDeletingItem={this.handleDeletingItem}
            form={form}
          />
        </div>
      </div>
    )
  }
}
