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
          <div>
            <zapier-full-experience
              client-id="ErISwlFUiGdIii8d6My1VqbEPyA4Ssx2jIHmu8IT"
              theme="light"
              app-search-bar-display="show"
            />
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
