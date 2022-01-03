import React, { Component } from 'react'
import Renderer from '../Renderer'
import CapabilitiesContext from '../../capabilities.context'

class FormProperties extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeTab: false
    }

    this.handleEmailChange = this.handleEmailChange.bind(this)
    this.handleTyPageTitleChange = this.handleTyPageTitleChange.bind(this)
    this.handleTyPageTextChange = this.handleTyPageTextChange.bind(this)
    this.handleCustomCSSTextChange = this.handleCustomCSSTextChange.bind(this)
  }

  handleEmailChange(elem, e) {
    this.props.setIntegration({
      type: 'email',
      to: e.target.value
    })
  }

  handleTyPageTitleChange(elem, e) {
    this.props.setIntegration({
      type: 'tyPageTitle',
      value: e.target.value
    })
  }

  handleTyPageTextChange(elem, e) {
    this.props.setIntegration({
      type: 'tyPageText',
      value: e.target.value
    })
  }

  handleCustomCSSTextChange(elem, e) {
    this.props.setCSS({
      value: e.target.value,
      isEncoded: false
    })
  }

  render() {
    const capabilities = this.props.capabilities //To be changed with capabilities middleware.
    const integrations = this.props.form.props.integrations || []

    const matchingIntegration = (type) =>
      integrations.filter((integration) => integration.type === type)

    let email = ''

    if (matchingIntegration('email').length > 0) {
      email = matchingIntegration('email')[0].to
    }

    let tyPageTitle = 'Thank you!'

    if (matchingIntegration('tyPageTitle').length > 0) {
      tyPageTitle = matchingIntegration('tyPageTitle')[0].value
    }

    let tyPageText =
      'Your submission has been successful and we informed the form owner about it.'

    if (capabilities.sendgridApiKey === false) {
      tyPageText = 'Your submission has been successful.'
    }

    if (matchingIntegration('tyPageText').length > 0) {
      tyPageText = matchingIntegration('tyPageText')[0].value
    }

    let customCSS = ''

    if (this.props.form.props.customCSS !== undefined) {
      customCSS = this.props.form.props.customCSS.value
    }

    return (
      <div>
        <h2>Form Properties</h2>
        {capabilities.sendgridApiKey ? (
          <Renderer
            handleFieldChange={this.handleEmailChange}
            theme="infernal"
            form={{
              props: {
                elements: [
                  {
                    id: 1,
                    type: 'TextBox',
                    label: 'Send submission notifications to',
                    value: email
                  }
                ]
              }
            }}
          />
        ) : (
          ''
        )}
        <Renderer
          handleFieldChange={this.handleTyPageTitleChange}
          theme="infernal"
          form={{
            props: {
              elements: [
                {
                  id: 2,
                  type: 'TextBox',
                  label: 'Thank you page title',
                  maxLength: 128,
                  value: tyPageTitle
                }
              ]
            }
          }}
        />
        <Renderer
          handleFieldChange={this.handleTyPageTextChange}
          theme="infernal"
          form={{
            props: {
              elements: [
                {
                  id: 3,
                  type: 'TextArea',
                  label: 'Thank you page text',
                  maxLength: 256,
                  value: tyPageText
                }
              ]
            }
          }}
        />
        <Renderer
          handleFieldChange={this.handleCustomCSSTextChange}
          theme="infernal"
          form={{
            props: {
              elements: [
                {
                  id: 4,
                  type: 'TextArea',
                  label: 'Add custom CSS',
                  value: customCSS
                }
              ]
            }
          }}
        />
      </div>
    )
  }
}

const FormPropertiesWrapped = (props) => (
  <CapabilitiesContext.Consumer>
    {(capabilities) => (
      <FormProperties {...props} capabilities={capabilities} />
    )}
  </CapabilitiesContext.Consumer>
)

export default FormPropertiesWrapped
