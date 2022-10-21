import React, { Component } from 'react'

import * as IntegrationComponents from '../integrations'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faCircleMinus } from '@fortawesome/free-solid-svg-icons'

import './FormIntegrations.css'

export default class FormIntegrations extends Component {
  constructor(props) {
    super(props)

    this.getIntegrationMetaData = this.getIntegrationMetaData.bind(this)
  }

  getIntegrationMetaData() {
    const list = []

    Object.values(IntegrationComponents).forEach((IntegrationComponent) => {
      const integration = IntegrationComponent.metaData
      const matchedIntegration = this.props.form.props.integrations.find(
        (i) => i.type === integration.name
      )
      if (matchedIntegration !== undefined) {
        integration.activeStatus = matchedIntegration.active
      } else {
        integration.activeStatus = false
      }
      list.push(integration)
    })
    return list
  }

  render() {
    const integrationList = this.getIntegrationMetaData()
    return (
      <>
        <div className="integrationsMessage">
          Integrate Your Form to Other Applications
        </div>
        <div className="integrationsWrapper">
          {integrationList.map((item, key) => (
            <div
              className={
                this.props.selectedIntegration ===
                item.displayText.replaceAll(' ', '')
                  ? 'integration active'
                  : 'integration'
              }
              key={key}
              onClick={() => this.props.handleIntegrationClick(item)}>
              <img alt="logo" src={item.icon} className="logo" />
              <div className="title">{item.displayText}</div>
              <FontAwesomeIcon
                icon={item.activeStatus ? faCheckCircle : faCircleMinus}
                className="activeStatus"
              />
            </div>
          ))}
        </div>
      </>
    )
  }
}
