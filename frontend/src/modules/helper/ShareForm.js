import React, { Component } from 'react'
import CopyToClipboard from '../common/CopyToClipboard'
import './ShareForm.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import QRCode from 'qrcode.react'

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
    this.downloadQRCode = this.downloadQRCode.bind(this)

    this.hostname = global.env.FE_BACKEND
    this.formId = this.props.formId
    this.uuid = this.props.uuid
    this.formLink = `${this.hostname}/form/view/${this.uuid}`

    this.state = {
      widget: false,
      title: '',
      answered_once: false
    }
  }

  async onWidgetChange() {
    if (this.props.canEdit) {
      let widget = !this.state.widget
      this.setState({ widget })
    }
  }

  async onAnsweredOnceChange() {
    if (this.props.canEdit) {
      let answered_once = !this.state.answered_once
      this.setState({ answered_once })
    }
  }

  async onWidgetTitleChange(e) {
    if (this.props.canEdit) {
      let title = e.target.value.replace(/[^a-zA-Z ]/g, '')
      this.setState({ title })
    }
  }

  async downloadQRCode(type = 'png') {
    let downloadLink = document.createElement('a')

    if (type === 'svg') {
      const svg = document.getElementById('qrCodeSvg')
      const clone = svg.cloneNode(true)
      clone.removeAttribute('style')
      const svgData = new XMLSerializer().serializeToString(clone)
      const svgBlob = new Blob([svgData], {
        type: 'image/svg+xml;charset=utf-8'
      })
      const svgUrl = URL.createObjectURL(svgBlob)
      downloadLink.href = svgUrl
      downloadLink.download = 'qrCode.svg'
    } else if (type === 'png') {
      const canvas = document.getElementById('qrCodeCanvas')
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream')
      downloadLink.href = pngUrl
      downloadLink.download = 'qrCode.png'
    }

    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  render() {
    const { widget, title, answered_once } = this.state

    const embedCode = ` 
      <script 
        src="${this.hostname}/runtime/embed.js"
        data-fp-id="${this.uuid}"
        ${this.state.widget ? ' data-fp-widget="true"' : ''} 
        ${
          this.state.answered_once
            ? ` data-fp-widget-cookie="${this.formId}"`
            : ''
        } 
        ${
          this.state.title ? ` data-fp-widget-title="${this.state.title}"` : ''
        }>
      </script>
        `.replace(/\s+/g, ' ')

    return (
      <>
        <div className="shareFormTabCover">
          <h2 className="shareFormTitle">Share Your Form</h2>
          {this.props.published === false ? (
            <div className="shareFormPublishedWarning">
              You have not published this form yet. Please publish it before
              sharing.
            </div>
          ) : (
            <>
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
                  checked={widget}
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
                    checked={answered_once}
                    className="shareFormSettingsInput"
                    onChange={this.onAnsweredOnceChange}
                  />
                  <label htmlFor="widget_once">Single submission</label>
                </div>
              </div>
              <div className="shareFormContent">
                <div className="shareFormFormUrlArea">
                  <h3 className="shareFormFormUrlAreaTitle">URL</h3>
                  <input
                    type="text"
                    value={this.formLink}
                    className="formURL"
                    readOnly
                  />
                  <div className="urlAreaControls">
                    <button
                      onClick={() => {
                        window.open(this.formLink, '_blank')
                      }}
                      className="shareSectionButton">
                      View Form
                    </button>
                    <CopyToClipboard
                      clipboardData={this.formLink}
                      buttonText="Copy URL"
                    />
                  </div>
                </div>

                <div className="shareFormFormQRArea">
                  <h3 className="shareFormFormQRAreaTitle">QR Code</h3>
                  <div className="qrCodeContainer">
                    <QRCode
                      value={this.formLink}
                      size={160}
                      id="qrCodeCanvas"
                      className="shareFormFormQRCode"
                      renderAs="canvas"
                    />
                  </div>
                  <QRCode
                    value={this.formLink}
                    size={160}
                    style={{ display: 'none' }}
                    id="qrCodeSvg"
                    renderAs="svg"
                  />
                  <div className="qrDownloadOptions">
                    <button
                      onClick={() => {
                        this.downloadQRCode('png')
                      }}
                      className="shareSectionButton">
                      Download PNG
                    </button>
                    <button
                      onClick={() => {
                        this.downloadQRCode('svg')
                      }}
                      className="shareSectionButton">
                      Download SVG
                    </button>
                  </div>
                </div>
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
                    Embed Code
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
            </>
          )}
        </div>

        {this.props.published === false ? null : (
          <div className="share-iframe-container">
            <div className="shareFormMessage">
              Below is a view of your form. You cannot make any changes here.
            </div>
            <iframe
              title="form-preview"
              src={this.formLink}
              className={'share-iframe'}
            />
          </div>
        )}
      </>
    )
  }
}

export default ShareForm
