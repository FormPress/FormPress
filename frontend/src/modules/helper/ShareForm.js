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
  render() {
    const hostname = window.location.protocol + '//' + window.location.host
    const embedCode = [
      `<script src="${hostname}/runtime/embed.js" fp_id="${this.props.formId}">`,
      '</script>'
    ].join('\n')
    return (
      <div className="col-15-16 shareForm">
        <div className="shareFormTab col-8-16">
          <div className="shareFormTabCover">
            <h2 className="shareFormTitle">Share Your Form</h2>
            <div className="shareFormMessage">
              Be sure that your latest changes have been saved and published
              before sharing. Otherwise your form will be seen latest saved
              version.
            </div>
            <div className="shareFormContent">
              <div className="shareFormFormUrlArea">
                <h3 className="shareFormFormUrlAreaTitle">
                  The URL of your form:
                </h3>
                <input
                  type="text"
                  value={`${hostname}/form/view/${this.props.formId}`}
                  className="formURL"
                  readOnly
                />
              </div>
              <CopyToClipboard
                clipboardData={`${hostname}/form/view/${this.props.formId}`}
                buttonText="Copy the URL"
              />
              <div className="shareFormFormEmbedCodeArea">
                <h3 className="shareFormFormEmbedCodeAreaTitle">
                  The Embed Code of your form:
                </h3>
                <textarea className="embedCode" value={embedCode} readOnly />
              </div>
              <CopyToClipboard
                clipboardData={embedCode}
                buttonText="Copy the code"
              />
            </div>
            <div className="shareFormFooterArea">
              <h5 className="shareFormFooterTitle">Share your form via</h5>
              <div className="shareFormButtonArea">
                <div className="shareFormButtonCover">
                  <TwitterShareButton
                    title="Checkout my form"
                    url={`${hostname}/form/view/${this.props.formId}`}>
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>

                  <FacebookShareButton
                    title="Checkout my form"
                    url={`${hostname}/form/view/${this.props.formId}`}>
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>

                  <LinkedinShareButton
                    title="Checkout my form"
                    url={`${hostname}/form/view/${this.props.formId}`}>
                    <LinkedinIcon size={32} round />
                  </LinkedinShareButton>

                  <WhatsappShareButton
                    title="Checkout my form"
                    url={`${hostname}/form/view/${this.props.formId}`}>
                    <WhatsappIcon size={32} round />
                  </WhatsappShareButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ShareForm
