import React, { Component } from 'react'

import './PreviewForm.css'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class PreviewForm extends Component {
  render() {
    const BACKEND = process.env.REACT_APP_BACKEND
    const { formID } = this.props

    return (
      <div className="preview-form-wrapper">
        <div className="preview-warning-wrapper">
          <div className="preview-warning-navback">
            <button
              className="preview-warning-navback-button"
              onClick={() =>
                this.props.history.push(`/editor/${formID}/builder`)
              }>
              <FontAwesomeIcon icon={faChevronLeft} size="1x" />
              &nbsp;BACK
            </button>
          </div>

          <div className="preview-warning-text">
            <div className="preview-warning-icon">
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="exclamation-triangle"
                className="svg-inline--fa fa-exclamation-triangle fa-w-18"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512">
                <path
                  fill="currentColor"
                  d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path>
              </svg>
            </div>
            This is a preview of your form. <br />
            Only you can see the preview of your forms.
          </div>
        </div>
        <div className="iframe-wrapper">
          <iframe
            src={`${BACKEND}/form/view/${formID}?preview=true`}
            title={`FP_FORM_${formID}`}
          />
        </div>
      </div>
    )
  }
}

export default PreviewForm
