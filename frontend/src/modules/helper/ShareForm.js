import React, { Component } from 'react'
import CopyToClipboard from '../common/CopyToClipboard'
import './ShareForm.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

import {
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share'

import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  WhatsappShareButton
} from 'react-share'

class ShareForm extends Component {
  constructor(props) {
    super(props)
    this.onWidgetTitleChange = this.onWidgetTitleChange.bind(this)
    this.onWidgetChange = this.onWidgetChange.bind(this)
    this.onAnsweredOnceChange = this.onAnsweredOnceChange.bind(this)

    this.hostname = window.location.protocol + '//' + window.location.host
    this.formId = this.props.formId
    this.formLink = `${this.hostname}/form/view/${this.formId}`

    this.state = {
      widget: false,
      title: '',
      answered_once: false
    }
  }

  async onWidgetChange() {
    let widget = !this.state.widget
    this.setState({ widget })
  }

  async onAnsweredOnceChange() {
    let answered_once = !this.state.answered_once
    this.setState({ answered_once })
  }

  async onWidgetTitleChange(e) {
    let title = e.target.value.replace(/[^a-zA-Z ]/g, '')
    this.setState({ title })
  }

  render() {
    const { widget, title, answered_once } = this.state

    const embedCode = ` 
      <script 
        src="${this.hostname}/runtime/embed.js"
        fp_id="${this.formId}"
        ${this.state.widget ? ' fp_widget="true"' : ''} 
        ${this.state.answered_once ? `fp_widget_cookie="${this.formId}"` : ''} 
        ${this.state.title ? ` fp_widget_title="${this.state.title}"` : ''}>
      </script>
        `.replace(/\s+/g, ' ')

    return (
      <div className="col-15-16 shareForm">
        <div className="shareFormTab col-5-16">
          <div className="shareFormTabCover">
            <h2 className="shareFormTitle">Share Your Form</h2>
            <div className="shareFormMessage">
              Before you share your form,{' '}
              <strong>
                make sure you saved and published the latest version of it.
              </strong>{' '}
              Otherwise, the most recently published version will be shared.
            </div>
            <div className="shareFormSettings">
              <input
                id="widget"
                type="checkbox"
                name="widget"
                value={widget}
                className="shareFormSettingsInput"
                onChange={this.onWidgetChange}
              />
              <label htmlFor="widget">Set form as widget</label>
              <div className="shareFormSettingsWidgetContainer">
                <label>Widget Title</label>
                <input
                  type="text"
                  className="formURL"
                  name="widget_title"
                  value={title}
                  onChange={this.onWidgetTitleChange}
                  placeholder="Enter widget title"
                  maxLength="32"
                />
              </div>
              <div className="submitOnceTooltip">
                <span className="popover-container">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <div className="popoverText">
                    Allows each respondent to submit the form only once
                  </div>
                </span>
              </div>
              <div>
                <input
                  id="widget_once"
                  type="checkbox"
                  name="widget_once"
                  value={answered_once}
                  className="shareFormSettingsInput"
                  onChange={this.onAnsweredOnceChange}
                />
                <label htmlFor="widget_once">Single submission</label>
              </div>
            </div>
            <div className="shareFormContent">
              <div className="shareFormFormUrlArea">
                <h3 className="shareFormFormUrlAreaTitle">URL of your form</h3>
                <input
                  type="text"
                  value={this.formLink}
                  className="formURL"
                  readOnly
                />
              </div>
              <CopyToClipboard
                clipboardData={this.formLink}
                buttonText="Copy URL"
              />
              <div className="embedCodeTooltip">
                <span className="popover-container">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <div className="popoverText">
                    Use this code to embed the form into your webpage
                  </div>
                </span>
              </div>

              <div className="shareFormFormEmbedCodeArea">
                <h3 className="shareFormFormEmbedCodeAreaTitle">
                  Embed Code of your form
                </h3>
                <textarea className="embedCode" value={embedCode} readOnly />
              </div>
              <CopyToClipboard
                clipboardData={embedCode}
                buttonText="Copy embed code"
              />
            </div>
            <div className="shareFormFooterArea">
              <h5 className="shareFormFooterTitle">Share your form via</h5>
              <div className="shareFormButtonArea">
                <div className="shareFormButtonCover">
                  <TwitterShareButton
                    title="Here is my most recent form, ready to be filled out!"
                    url={this.formLink}
                    className="shareButton">
                    <TwitterIcon size={48} round />
                  </TwitterShareButton>
                  <FacebookShareButton
                    quote="Here is my most recent form, ready to be filled out!"
                    url={this.formLink}
                    className="shareButton">
                    <FacebookIcon size={48} round />
                  </FacebookShareButton>

                  <LinkedinShareButton
                    title="Here is my most recent form, ready to be filled out!"
                    url={this.formLink}
                    className="shareButton">
                    <LinkedinIcon size={48} round />
                  </LinkedinShareButton>

                  <WhatsappShareButton
                    title="Here is my most recent form, ready to be filled out!"
                    url={this.formLink}>
                    <WhatsappIcon size={48} round />
                  </WhatsappShareButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-10-16 share-iframe-container">
          <div className="shareFormMessage">
            Below is a view of your form. You cannot make any changes here.
          </div>
          <iframe
            title="form-preview"
            src={this.formLink}
            className={'share-iframe'}
          />
        </div>
      </div>
    )
  }
}

export default ShareForm
