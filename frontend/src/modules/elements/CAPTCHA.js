import React, { Component } from 'react'

import ElementContainer from '../common/ElementContainer'
import { faMinus } from '@fortawesome/free-solid-svg-icons' // TODO: replace with CAPTCHA icon

import './CAPTCHA.css'

export default class CAPTCHA extends Component {
  static weight = 17

  static defaultConfig = {
    id: 0,
    type: 'CAPTCHA',
    provider: 'reCAPTCHA'
  }

  static metaData = {
    icon: faMinus,
    displayText: 'CAPTCHA',
    group: 'inputElement'
  }

  render() {
    const { config, mode } = this.props

    let display
    if (mode === 'builder') {
      display = [<div key={1}> CAPTCHA Static Image mode </div>]
    } else {
      const siteKey = process.env?.RECAPTCHA_SITE_KEY
      display = [
        <div
          key={1}
          className="g-recaptcha"
          data-sitekey={siteKey}
          data-action="submission"></div>,
        <script
          key={2}
          src="https://www.google.com/recaptcha/enterprise.js"
          async
          defer></script>
      ]
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        {display}
      </ElementContainer>
    )
  }
}
