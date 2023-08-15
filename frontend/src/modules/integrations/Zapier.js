import React, { Component } from 'react'
import './Zapier.css'

export default class Zapier extends Component {
  static metaData = {
    icon: 'https://cdn.zapier.com/zapier/images/logos/zapier-logomark.png',
    displayText: 'Zapier',
    name: 'Zapier'
  }

  constructor(props) {
    super(props)
    this.state = {
      display: this.props.activeStatus ? 'active' : 'description',
      tempIntegrationObject: { ...this.props.integrationObject }
    }
  }

  render() {
    let display
    let paused
    if (this.props.tempIntegrationObject?.paused !== undefined) {
      paused = this.props.tempIntegrationObject.paused
    } else {
      paused = this.state.tempIntegrationObject.paused
    }

    if (
      paused ||
      (this.props.activeStatus && this.state.display === 'active')
    ) {
      // INTEGRATION ACTIVE PAGE
      display = <></>
    } else if (
      this.props.activeStatus === false &&
      this.state.display === 'description'
    ) {
      // DESCRIPTION
      display = (
        <>
          <div className="integration-motto">
            Get instant updates on your form submissions with Zapier!
          </div>
          <div className="integration-text">
            Enhance your form builder app with the power of Zapier integration!
            Seamlessly connect your forms to a vast array of applications,
            opening up endless possibilities for workflow automation. Zapier
            allows you to effortlessly transmit form submissions to your
            preferred apps, saving time and streamlining your processes. Explore
            the convenience and efficiency of Zapier&#39;s versatile
            integrations and take your productivity to new heights
          </div>
          <div className="activation-button wip">
            <button type="button" onClick={this.handleConfigureWebhook}>
              Coming Soon...
            </button>
          </div>
        </>
      )
    } else if (this.state.display === 'configuration') {
      // CONFIGURATION
      display = <></>
    }
    return (
      <div className="integration-wrapper ">
        <div className="close-button">
          <span
            className="close-integration"
            onClick={() => this.props.handleCloseIntegrationClick()}>
            x
          </span>
        </div>
        <div className="integration-header">
          <img src={Zapier.metaData.icon} className="logo" alt="Zapier-logo" />
          <div className="title">{Zapier.metaData.displayText}</div>
        </div>
        <div className="integration-content">{display}</div>
      </div>
    )
  }
}
