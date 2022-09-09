import React, { Component } from 'react'
import Renderer from '../Renderer'
import CapabilitiesContext from '../../capabilities.context'
import './FormProperties.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faInfoCircle,
  faCode,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons'

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
    this.handleElemPerPageChange = this.handleElemPerPageChange.bind(this)
    this.handleFormPrivateChange = this.handleFormPrivateChange.bind(this)
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

  handleElemPerPageChange(elem, e) {
    if (elem.type === 'Checkbox') {
      this.props.setAutoPageBreak('active', e.target.checked)
    }

    if (elem.type === 'Number') {
      if (!isNaN(e.target.value)) {
        this.props.setAutoPageBreak('elemPerPage', e.target.value)
      }
    }

    if (elem.label === 'Previous Button Text') {
      this.props.setAutoPageBreak('prevButtonText', e.target.value)
    }

    if (elem.label === 'Next Button Text') {
      this.props.setAutoPageBreak('nextButtonText', e.target.value)
    }

    if (elem.label === 'Submit Button Text') {
      this.props.setAutoPageBreak('submitButtonText', e.target.value)
    }
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

  handleFormPrivateChange(elem, e) {
    this.props.setFormAsPrivate(e.target.checked)
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
      'Your submission was successful and the form owner has been notified.'

    if (capabilities.sendgridApiKey === false) {
      tyPageText = 'Your submission was successful.'
    }

    if (matchingIntegration('tyPageText').length > 0) {
      tyPageText = matchingIntegration('tyPageText')[0].value
    }

    let customCSS = ''

    if (this.props.form.props.customCSS !== undefined) {
      customCSS = this.props.form.props.customCSS.value
    }

    let privateForm = 0

    if (this.props.form.private !== undefined) {
      privateForm = this.props.form.private
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

    let autoPageBreak = {
      active: false,
      elemPerPage: 0,
      prevButtonText: 'Previous',
      nextButtonText: 'Next',
      submitButtonText: 'Submit'
    }

    if (this.props.form.props.autoPageBreak !== undefined) {
      autoPageBreak = {
        ...this.props.form.props.autoPageBreak
      }
    }

    return (
      <div className="formProperties">
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
        <div className="evaluateFormTooltip">
          <span className="popover-container">
            <FontAwesomeIcon icon={faInfoCircle} />
            <div className="popoverText">
              Enable this if you want your form to be in test-format with
              correct answers etc. Works properly only with single choice
              element for now
            </div>
          </span>
        </div>
        <Renderer
          handleFieldChange={this.handleSubmitBehaviourChange}
          theme="infernal"
          form={{
            props: {
              elements: [
                {
                  id: 5,
                  type: 'Radio',
                  label: 'Upon Submission',
                  value: submitBehaviour,
                  options: ['Show Thank You Page', 'Evaluate Form']
                }
              ]
            }
          }}
        />
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
          className={submitBehaviour === 'Show Thank You Page' ? '' : 'dn'}
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
          className={submitBehaviour === 'Show Thank You Page' ? '' : 'dn'}
        />
        <span className="popover-container">
          <FontAwesomeIcon icon={faInfoCircle} />
          <div className="popoverText">
            Enabling this option will disable all previously added page breaks
          </div>
        </span>
        <Renderer
          handleFieldChange={this.handleElemPerPageChange}
          theme="infernal"
          allowInternal={true}
          className={
            'autoPageBreakForm' +
            (autoPageBreak.active ? '' : ' autoPageBreakDisabled')
          }
          form={{
            props: {
              elements: [
                {
                  id: 7,
                  type: 'Checkbox',
                  options: ['Auto-pagination'],
                  value: autoPageBreak.active
                },
                {
                  id: 6,
                  type: 'Number',
                  label: 'Questions Per Page',
                  value: autoPageBreak.elemPerPage
                },
                {
                  id: 9,
                  type: 'TextBox',
                  label: 'Previous Button Text',
                  maxLength: 32,
                  value: autoPageBreak.prevButtonText,
                  placeholder: 'Previous'
                },
                {
                  id: 10,
                  type: 'TextBox',
                  label: 'Next Button Text',
                  maxLength: 32,
                  value: autoPageBreak.nextButtonText,
                  placeholder: 'Next'
                },
                {
                  id: 11,
                  type: 'TextBox',
                  label: 'Submit Button Text',
                  maxLength: 32,
                  value: autoPageBreak.submitButtonText,
                  placeholder: 'Submit'
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
        <details
          className="adv-settings"
          title="This part contains advanced settings. Some settings may cause your form to stop working properly.">
          <summary className="adv-settings-summary">
            <FontAwesomeIcon className="adv-settings-icon" icon={faCode} />
            &nbsp; Developer settings
          </summary>
          <div className="adv-settings-row">
            <Renderer
              handleFieldChange={this.handleFormPrivateChange}
              theme="infernal"
              form={{
                props: {
                  elements: [
                    {
                      id: 12,
                      type: 'Checkbox',
                      options: ['Private Form'],
                      value: !!privateForm
                    }
                  ]
                }
              }}
            />
            <div className="privateFormTooltip">
              <span className="popover-container">
                <FontAwesomeIcon icon={faQuestionCircle} />
                <div className="popoverText">
                  Setting this form to private will hide it from the public. The
                  form will be accessible only via a token
                </div>
              </span>
            </div>
          </div>
        </details>
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
