import React, { Component } from 'react'
import Renderer from '../Renderer'

export default class FormProperties extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeTab: false
    }

    this.handleFieldChange = this.handleFieldChange.bind(this)
  }

  handleFieldChange(elem, e) {
    this.props.setIntegration({
      type: 'email',
      to: e.target.value
    })
  }

  render() {
    const integrations = this.props.form.props.integrations || []

    const matchingIntegration = integrations.filter(
      (integration) => integration.type === 'email'
    )
    let email = ''

    if (matchingIntegration.length > 0) {
      email = matchingIntegration[0].to
    }

    return (
      <div>
        <h2>Form Properties</h2>
        <Renderer
          handleFieldChange={this.handleFieldChange}
          theme="infernal"
          form={{
            props: {
              elements: [
                {
                  id: 1,
                  type: 'Text',
                  label: 'Send submission notifications to',
                  value: email
                }
              ]
            }
          }}
        />
      </div>
    )
  }
}
