import React, { Component } from 'react'
import Renderer from '../Renderer'
import CapabilitiesContext from '../../capabilities.context'
import './FormProperties.css'

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
    this.handleAddTag = this.handleAddTag.bind(this)
    this.handleSubmitBehaviourChange = this.handleSubmitBehaviourChange.bind(
      this
    )
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

  handleSubmitBehaviourChange(elem, e) {
    this.props.setIntegration({
      type: 'submitBehaviour',
      value: e.target.value
    })
  }

  handleAddTag(e) {
    e.preventDefault()
    let tagsArray = []

    if (this.props.form.props.tags !== undefined) {
      const { tags } = this.props.form.props
      tagsArray = [...tags]
    }
    let tag = ''
    const regexp = /^([\w-]+)/g

    const filteredTag = e.target[0].value.match(regexp)

    if (filteredTag !== null) {
      tag = filteredTag[0]
      tagsArray.push(tag)
    }

    this.props.setFormTags(tagsArray)

    e.target[0].value = ''
  }

  handleRemoveTag(i) {
    const tagsArray = [...this.props.form.props.tags]
    tagsArray.splice(i, 1)
    this.props.setFormTags(tagsArray)
  }

  render() {
    const capabilities = this.props.capabilities
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

    let tags = []
    if (this.props.form.props.tags !== undefined) {
      if (this.props.form.props.tags.length !== 0) {
        tags = this.props.form.props.tags
      }
    }

    let submitBehaviour = 'Show Thank You Page'
    if (matchingIntegration('submitBehaviour').length > 0) {
      submitBehaviour = matchingIntegration('submitBehaviour')[0].value
    }

    return (
      <div className="formProperties">
        <h2>Form Properties</h2>
        <Renderer
          handleFieldChange={this.handleSubmitBehaviourChange}
          theme="infernal"
          form={{
            props: {
              elements: [
                {
                  id: 5,
                  type: 'Radio',
                  label: 'On Submit',
                  value: submitBehaviour,
                  options: ['Show Thank You Page', 'Evaluate Form']
                }
              ]
            }
          }}
        />
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
                  label: 'Custom CSS',
                  value: customCSS
                }
              ]
            }
          }}
        />
        <div className="tags-wrapper">
          <div className="tags-label">
            <span>Tags</span>
          </div>
          <div className="tags-list">
            {!tags
              ? null
              : tags.map((tag, i) => (
                  <span key={i} className="tag">
                    {tag}
                    <span
                      key={i}
                      className="tag-close"
                      onClick={this.handleRemoveTag.bind(this, i)}>
                      x
                    </span>
                  </span>
                ))}
          </div>
          <div className="tag-controls">
            <form onSubmit={this.handleAddTag}>
              <input type="text" maxLength="24" />
              <input type="submit" value="Add" />
            </form>
          </div>
        </div>
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
