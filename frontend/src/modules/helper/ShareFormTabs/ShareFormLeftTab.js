import React from 'react'
import CopyToClipboard from '../../common/CopyToClipboard'
import './ShareFormLeftTab.css'

const ShareFormLeftTab = ({ backEnd, embedCode, formId }) => {
  return (
    <div className="shareFormLeftTab col-6-16">
      <div className="shareFormLeftTabCover">
        <h2 className="shareFormLeftTitle">Share Your Form</h2>
        <div className="shareFormMessage">
          Be sure that your latest changes have been saved and published before
          sharing. Otherwise your form will be seen latest saved version.
        </div>
        <div className="shareFormLeftContent">
          <div className="shareFormLeftFormUrlArea">
            <h3 className="shareFormLeftFormUrlAreaTitle">
              The URL of your form:
            </h3>
            <input
              type="text"
              value={`${backEnd}/form/view/${formId}`}
              className="formURL"
              readOnly
            />
          </div>
          <CopyToClipboard
            clipboardData={`${backEnd}/form/view/${formId}`}
            buttonText="Copy the URL"
          />
          <div className="shareFormLeftFormEmbedCodeArea">
            <h3 className="shareFormLeftFormEmbedCodeAreaTitle">
              The Embed Code of your form:
            </h3>
            <textarea className="embedCode" value={embedCode} readOnly />
          </div>
          <CopyToClipboard
            clipboardData={embedCode}
            buttonText="Copy the code"
          />
        </div>
      </div>
    </div>
  )
}

export default ShareFormLeftTab
