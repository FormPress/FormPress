import React, { Component } from 'react'
import './Zapier.css'
import { FPLoader } from '../../svg'

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
      tempIntegrationObject: { ...this.props.integrationObject },
      loading: true
    }
  }

  componentDidMount() {
    const script = document.createElement('script')
    script.id = 'zapier-script'
    script.type = 'module'
    script.src =
      'https://cdn.zapier.com/packages/partner-sdk/v0/zapier-elements/zapier-elements.esm.js'
    script.addEventListener('load', () => {
      this.setState({ loading: false })
    })

    const link = document.createElement('link')
    link.id = 'zapier-style'
    link.rel = 'stylesheet'
    link.href =
      'https://cdn.zapier.com/packages/partner-sdk/v0/zapier-elements/zapier-elements.css'

    document.body.appendChild(script)
    document.body.appendChild(link)
  }

  componentWillUnmount() {
    // remove script and style
    const script = document.getElementById('zapier-script')
    const link = document.getElementById('zapier-style')
    script.remove()
    link.remove()
  }

  render() {
    if (this.state.loading) {
      return <FPLoader />
    }

    let display

    const clientID = global.env.FE_ZAPIER_APP_CLIENT_ID

    display = (
      <>
        <div>
          <zapier-full-experience
            client-id={clientID}
            theme="light"
            app-search-bar-display="show"
          />
        </div>
      </>
    )

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
