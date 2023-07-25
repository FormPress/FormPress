import React, { Component } from 'react'
import Renderer from '../Renderer'
import './FormProperties.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faInfoCircle,
  faCode,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons'

export default class FormProperties extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeTab: false
    }

    this.handleEmailChange = this.handleEmailChange.bind(this)
    this.handleEmailSubjectChange = this.handleEmailSubjectChange.bind(this)
    this.handleEmailReplyToChange = this.handleEmailReplyToChange.bind(this)
    this.handleEmailReplyToCustomChange = this.handleEmailReplyToCustomChange.bind(
      this
    )
    this.handleTyPageTitleChange = this.handleTyPageTitleChange.bind(this)
    this.handleTyPageTextChange = this.handleTyPageTextChange.bind(this)
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

  handleEmailSubjectChange(elem, e) {
    this.props.setIntegration({
      type: 'email',
      subject: e.target.value
    })
  }

  handleEmailReplyToChange(elem) {
    this.props.setIntegration({
      type: 'email',
      replyTo: elem.target.value
    })
  }

  handleEmailReplyToCustomChange(elem, e) {
    this.props.setIntegration({
      type: 'email',
      replyToCustom: e.target.value
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

    if (elem.type === 'NumberE') {
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
    const { capabilities } = this.props.generalContext
    const { form } = this.props
    const integrations = this.props.form.props.integrations || []

    const matchingIntegration = (type) =>
      integrations.filter((integration) => integration.type === type)
    let email = ''

    if (matchingIntegration('email').length > 0) {
      email = matchingIntegration('email')[0].to
    }

    const emailElements = form.props.elements.filter(
      (element) => element.type === 'Email'
    )

    let subject = 'New response: {FormTitle}'
    if (
      matchingIntegration('email').length > 0 &&
      matchingIntegration('email')[0].subject !== undefined
    ) {
      subject = matchingIntegration('email')[0].subject
    }

    let replyTo = 'none'
    if (
      matchingIntegration('email').length > 0 &&
      matchingIntegration('email')[0].replyTo !== undefined
    ) {
      replyTo = matchingIntegration('email')[0].replyTo
    }

    let replyToCustom
    if (
      matchingIntegration('email').length > 0 &&
      matchingIntegration('email')[0].replyToCustom !== undefined
    ) {
      replyToCustom = matchingIntegration('email')[0].replyToCustom
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
      elemPerPage: 1,
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
        <div className="formPropertiesMessage">
          Modify the settings of your form
        </div>
        {capabilities.sendgridApiKey ? (
          <div>
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
            <Renderer
              handleFieldChange={this.handleEmailSubjectChange}
              theme="infernal"
              form={{
                props: {
                  elements: [
                    {
                      id: 1,
                      type: 'TextBox',
                      label: 'Notification Email Subject',
                      value: subject
                    }
                  ]
                }
              }}
            />
            <div className="replyToSelectWrap">
              <div className="replyToSelectLabel">
                Notification Email Reply to:
              </div>
              <div className="replyToTooltip">
                <span className="popover-container">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <div className="popoverText">
                    You can also use Email elements in the form for dynamic
                    Reply to
                  </div>
                </span>
              </div>
              <select
                className="replyToSelect"
                value={replyTo}
                onChange={this.handleEmailReplyToChange}
                id="replyToSelect">
                <option value="none">None</option>
                {emailElements.map((element) => (
                  <option key={element.id} value={element.id}>
                    Form Field: {element.label}
                  </option>
                ))}

                <option value="custom">Custom</option>
              </select>
            </div>
            <div className={replyTo === 'custom' ? 'visible' : 'hidden'}>
              <Renderer
                handleFieldChange={this.handleEmailReplyToCustomChange}
                theme="infernal"
                form={{
                  props: {
                    elements: [
                      {
                        id: 1,
                        type: 'TextBox',
                        label: 'Reply to:',
                        value: replyToCustom
                      }
                    ]
                  }
                }}
              />
            </div>
          </div>
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
        <div className="autoPageBreakTooltip">
          <span className="popover-container">
            <FontAwesomeIcon icon={faInfoCircle} />
            <div className="popoverText">
              Enabling this option will disable all previously added page
              breaks.
            </div>
          </span>
        </div>
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
                  label: 'Auto-page break',
                  options: ['Enable'],
                  value: autoPageBreak.active
                },
                {
                  id: 6,
                  type: 'NumberE',
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
        <div className="tags-wrapper">
          <div className="tags-label elemLabelTitle">
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
          className="adv-settings element"
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
