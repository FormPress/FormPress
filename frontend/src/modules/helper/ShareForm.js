import React, { Component } from 'react'
import CopyToClipboard from '../common/CopyToClipboard'
import './ShareForm.css'
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

    const hostname = window.location.protocol + '//' + window.location.host
    this.formId = this.props.formId
    this.formLink = `${hostname}/form/view/${this.formId}`
    this.scriptStart = `<script src="${hostname}/runtime/embed.js" fp_id="${this.formId}"`
    this.scriptWidget = ` fp_widget="true"`
    this.scriptAnsweredOnce = ` fp_widget_cookie="${this.formId}"`
    this.scriptEnd = `></script>`

    this.state = {
      widget: false,
      widget_title: '',
      answered_once: false,
      embedCode: this.scriptStart + this.scriptEnd
    }
  }

  async onWidgetChange() {
    let widget = !this.state.widget
    let embedCode,
      widget_title = ` fp_widget_title="${this.state.widget_title}"`
    this.setState({ widget: widget }, () => {
      if (this.state.widget) {
        if (this.state.answered_once) {
          if (this.state.widget_title) {
            embedCode =
              this.scriptStart +
              this.scriptWidget +
              widget_title +
              this.scriptAnsweredOnce +
              this.scriptEnd
            widget_title = this.state.widget_title
          } else {
            embedCode =
              this.scriptStart +
              this.scriptWidget +
              this.scriptAnsweredOnce +
              this.scriptEnd
            widget_title = ''
          }
        } else {
          if (this.state.widget_title) {
            embedCode =
              this.scriptStart +
              this.scriptWidget +
              widget_title +
              this.scriptEnd
            widget_title = this.state.widget_title
          } else {
            embedCode = this.scriptStart + this.scriptWidget + this.scriptEnd
            widget_title = ''
          }
        }
      } else {
        widget_title = ''
        if (this.state.answered_once) {
          embedCode =
            this.scriptStart + this.scriptAnsweredOnce + this.scriptEnd
        } else {
          embedCode = this.scriptStart + this.scriptEnd
        }
      }
      this.setState({
        embedCode,
        widget_title
      })
    })
  }

  async onAnsweredOnceChange() {
    let answered_once = !this.state.answered_once
    let embedCode,
      widget_title = ` fp_widget_title="${this.state.widget_title}"`
    this.setState({ answered_once: answered_once }, () => {
      if (this.state.answered_once) {
        if (this.state.widget) {
          if (this.state.widget_title) {
            embedCode =
              this.scriptStart +
              this.scriptWidget +
              widget_title +
              this.scriptAnsweredOnce +
              this.scriptEnd
            widget_title = this.state.widget_title
          } else {
            embedCode =
              this.scriptStart +
              this.scriptWidget +
              this.scriptAnsweredOnce +
              this.scriptEnd
            widget_title = ''
          }
        } else {
          embedCode =
            this.scriptStart + this.scriptAnsweredOnce + this.scriptEnd
          widget_title = ''
        }
      } else {
        if (this.state.widget) {
          if (this.state.widget_title) {
            embedCode =
              this.scriptStart +
              this.scriptWidget +
              widget_title +
              this.scriptEnd
            widget_title = this.state.widget_title
          } else {
            embedCode = this.scriptStart + this.scriptWidget + this.scriptEnd
            widget_title = ''
          }
        } else {
          embedCode = this.scriptStart + this.scriptEnd
          widget_title = ''
        }
      }

      this.setState({
        embedCode,
        widget_title
      })
    })
  }

  async onWidgetTitleChange(e) {
    let tempWidgetTitle = e.target.value.replace(/[^a-zA-Z ]/g, '')
    let embedCode,
      widget_title = ` fp_widget_title="${tempWidgetTitle}"`
    this.setState({ widget_title: tempWidgetTitle }, () => {
      if (this.state.answered_once === true) {
        if (this.state.widget_title) {
          embedCode =
            this.scriptStart +
            this.scriptWidget +
            widget_title +
            this.scriptAnsweredOnce +
            this.scriptEnd
          widget_title = tempWidgetTitle
        } else {
          embedCode =
            this.scriptStart +
            this.scriptWidget +
            this.scriptAnsweredOnce +
            this.scriptEnd
          widget_title = ''
        }
      } else {
        if (this.state.widget_title) {
          embedCode =
            this.scriptStart + this.scriptWidget + widget_title + this.scriptEnd
          widget_title = tempWidgetTitle
        } else {
          embedCode = this.scriptStart + this.scriptWidget + this.scriptEnd
          widget_title = ''
        }
      }
      this.setState({
        embedCode,
        widget_title
      })
    })
  }

  render() {
    const { widget, widget_title, answered_once } = this.state
    console.log(this.state)
    return (
      <div className="col-15-16 shareForm">
        <div className="shareFormTab col-5-16">
          <div className="shareFormTabCover">
            <h2 className="shareFormTitle">Share Your Form</h2>
            <div className="shareFormMessage">
              Be sure that your latest changes have been saved and published
              before sharing. Otherwise your form will be seen latest saved
              version.
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
              <label htmlFor="widget">Show form as widget</label>
              <div className="shareFormSettingsWidgetContainer">
                <label>Widget Title</label>
                <input
                  type="text"
                  className="formURL"
                  name="widget_title"
                  value={widget_title}
                  onChange={this.onWidgetTitleChange}
                  placeholder="Enter widget title"
                  maxLength="32"
                />
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
                <label htmlFor="widget_once">
                  Set form to &quot;can be answered once&quot;
                </label>
              </div>
            </div>
            <div className="shareFormContent">
              <div className="shareFormFormUrlArea">
                <h3 className="shareFormFormUrlAreaTitle">
                  The URL of your form:
                </h3>
                <input
                  type="text"
                  value={this.formLink}
                  className="formURL"
                  readOnly
                />
              </div>
              <CopyToClipboard
                clipboardData={this.formLink}
                buttonText="Copy the URL"
              />
              <div className="shareFormFormEmbedCodeArea">
                <h3 className="shareFormFormEmbedCodeAreaTitle">
                  The Embed Code of your form:
                </h3>
                <textarea
                  className="embedCode"
                  value={this.state.embedCode}
                  readOnly
                />
              </div>
              <CopyToClipboard
                clipboardData={this.state.embedCode}
                buttonText="Copy the code"
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
            Be sure that your latest changes have been saved and published
            before sharing. Otherwise your form will be seen latest saved
            version.
          </div>
          <iframe src={this.formLink} className={'share-iframe'} />
        </div>
      </div>
    )
  }
}

export default ShareForm
