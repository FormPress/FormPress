import React, { Component } from 'react'
import Renderer from '../Renderer'

export default class QuestionProperties extends Component {
  constructor (props) {
    super(props)

    this.handleFieldChange = this.handleFieldChange.bind(this)
  }

  handleFieldChange (elem, e) {
    console.log('Field changed ', elem, e.target.value)
    const value = (e.target.type === 'checkbox') ? e.target.checked : e.target.value

    this.props.configureQuestion({
      id: this.props.selectedField.config.id,
      newState: {
        [elem.id]: value
      }
    })
  }

  render() {
    console.log('Rendering question settings ', this.props.selectedField)
    const { selectedField } = this.props
    const { configurableSettings, config } = selectedField
    const form = {
      props: {
        elements: []
      }
    }
    const keys = Object.keys(configurableSettings)

    for (const key of keys) {
      const question = configurableSettings[key]

      form.props.elements.push(Object.assign(
        { id: key },
        question.formProps,
        {
          value: config[key] || question.default
        }
      ))
    }


    return <div>
      <h2>Question Properties</h2>
      <Renderer
        handleFieldChange={ this.handleFieldChange }
        form={ form }
      />
    </div>
  }
}
