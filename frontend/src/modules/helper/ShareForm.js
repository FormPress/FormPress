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
        <div className="shareFormTab col-5-16">
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
                    title="Here is my most recent form, ready to be filled out!"
                    url={`${hostname}/form/view/${this.props.formId}`}
                    className="shareButton">
                    <TwitterIcon size={48} round />
                  </TwitterShareButton>
                  <FacebookShareButton
                    quote="Here is my most recent form, ready to be filled out!"
                    url={`${hostname}/form/view/${this.props.formId}`}
                    className="shareButton">
                    <FacebookIcon size={48} round />
                  </FacebookShareButton>

                  <LinkedinShareButton
                    title="Here is my most recent form, ready to be filled out!"
                    url={`${hostname}/form/view/${this.props.formId}`}
                    className="shareButton">
                    <LinkedinIcon size={48} round />
                  </LinkedinShareButton>

                  <WhatsappShareButton
                    title="Here is my most recent form, ready to be filled out!"
                    url={`${hostname}/form/view/${this.props.formId}`}>
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
          <iframe
            src={`${hostnamee}/form/view/${this.props.formId}`}
            className={'share-iframe'}
          />
        </div>
      </div>
    )
  }
}

export default ShareForm
