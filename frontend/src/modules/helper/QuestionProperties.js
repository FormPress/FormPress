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
      e.target.type === 'checkbox' ? e.target.checked : e.target.value

    this.props.configureQuestion({
      id: this.props.selectedField.config.id,
      newState: {
        [elem.id]: value
      }
    })

    if (e.target.id === 'q_required' && value === true) {
      let newValue = elem.value
      let elemId = elem.id.split('_')[1]
      this.props.configureQuestion({
        id: this.props.selectedField.config.id,
        newState: {
          [elemId]: newValue
        }
      })
    }
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

      form.props.elements.push(
        Object.assign({ id: key }, question.formProps, {
          value: config[key] || question.default
        })
      )
    }

    return (
      <div>
        <h2>Question Properties</h2>
        <Renderer
          theme="infernal"
          className="questionPropertiesForm"
          handleFieldChange={this.handleFieldChange}
          form={form}
        />
      </div>
    )
  }
}
