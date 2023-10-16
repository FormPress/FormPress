import React, { Component } from 'react'

import ElementContainer from '../common/ElementContainer'
import { faRefresh } from '@fortawesome/free-solid-svg-icons'

import './CAPTCHA.css'
import EditableLabel from '../common/EditableLabel'

export default class CAPTCHA extends Component {
  static weight = 12

  static defaultConfig = {
    id: 0,
    type: 'CAPTCHA',
    label: 'CAPTCHA',
    provider: 'reCAPTCHA',
    required: true
  }

  static metaData = {
    icon: faRefresh,
    displayText: 'CAPTCHA',
    group: 'inputElement'
  }

  static helpers = {
    getElementValue: () => {
      const captchaStatus = document.getElementById('recaptcha-status')?.value

      return captchaStatus === 'true' ? 'true' : 'false'
    },
    isFilled: (value) => {
      return value === 'true'
    }
  }

  render() {
    const { config, mode } = this.props

    let display
    if (mode === 'builder') {
      display = [
        <div className="elemLabelTitle" key={0}>
          <EditableLabel
            key={1}
            className="fl label"
            dataPlaceholder="Type a question"
            mode={mode}
            labelKey={config.id}
            handleLabelChange={this.props.handleLabelChange}
            value={config.label}
            required={config.required}
          />
        </div>,
        <div key={1}>
          {' '}
          <img
            src="https://developers.google.com/static/recaptcha/images/newCaptchaAnchor.gif"
            alt="reCAPTCHA"
            style={{ width: '302px', height: '76px' }}
          />
        </div>
      ]
    } else {
      const siteKey = process.env?.RECAPTCHA_SITE_KEY
      display = [
        <div className="elemLabelTitle" key={0}>
          <EditableLabel
            className="fl label"
            dataPlaceholder="Type a question"
            mode={mode}
            labelKey={config.id}
            value={config.label}
            required={config.required}
          />
        </div>,
        <input id="recaptcha-filled" type="hidden" key={1} value="false" />,
        <div
          key={2}
          className="g-recaptcha"
          data-sitekey={siteKey}
          data-action="submission"
          data-callback="captchaSubmit"></div>,
        <script
          key={3}
          src="https://www.google.com/recaptcha/enterprise.js"
          async
          defer></script>,
        <script
          key={4}
          dangerouslySetInnerHTML={{
            __html: `
            function captchaSubmit() {
              document.getElementById("recaptcha-filled").value = "true";
             
              var event = new Event('change');
              document.getElementById("qc_${config.id}").dispatchEvent(event);
            }
          
          `
          }}></script>
      ]
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        {display}
      </ElementContainer>
    )
  }
}
