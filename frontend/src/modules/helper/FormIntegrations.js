import React, { Component } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faPauseCircle } from '@fortawesome/free-solid-svg-icons'

import './FormIntegrations.css'
import * as Integrations from '../integrations'
import GeneralContext from '../../general.context'

class FormIntegrations extends Component {
  constructor(props) {
    super(props)

    this.getIntegrationMetaData = this.getIntegrationMetaData.bind(this)
    this.setRenderedIntegration = this.setRenderedIntegration.bind(this)
    this.handleCloseIntegrationClick = this.handleCloseIntegrationClick.bind(
      this
    )
    this.handleOpenIntegrationClick = this.handleOpenIntegrationClick.bind(this)

    this.state = {
      selectedIntegration: null
    }
  }

  handleOpenIntegrationClick(item) {
    if (this.props.canEdit) {
      const integrationName = item.displayText.replaceAll(' ', '')
      this.setState({
        selectedIntegration: integrationName
      })
    }
  }

  handleCloseIntegrationClick() {
    this.setState({
      selectedIntegration: false
    })
  }

  getIntegrationMetaData() {
    const list = []

    Object.values(Integrations).forEach((IntegrationComponent) => {
      const integration = IntegrationComponent.metaData
      const matchedIntegration = this.props.form.props.integrations.find(
        (i) => i.type === integration.name
      )
      if (matchedIntegration !== undefined) {
        integration.activeStatus = matchedIntegration.active
        integration.paused = matchedIntegration.paused || false
      } else {
        integration.activeStatus = false
      }
      list.push(integration)
    })
    return list
  }

  removeUnavailableIntegrations = (integration) => {
    const { capabilities } = this.props.generalContext
    const integrationsToRemove = []

    if (capabilities.googleCredentialsClientID === false) {
      integrationsToRemove.push('GoogleDrive')
      integrationsToRemove.push('GoogleSheets')
    }
    if (capabilities.zapierClientID === false) {
      integrationsToRemove.push('Zapier')
    }

    return !integrationsToRemove.includes(integration.name)
  }

  setRenderedIntegration() {
    const { form, savedForm } = this.props
    const { selectedIntegration } = this.state

    const Integration = Object.values(Integrations).find(
      (element) => element.metaData.name === selectedIntegration
    )
    const integrationObject =
      form.props.integrations.find(
        (i) => i.type === Integration.metaData.name
      ) || null
    const integrationValue = integrationObject ? integrationObject.value : false
    const activeStatus = integrationObject ? integrationObject.active : false
    return (
      <Integration
        className="integration-wrapper"
        handleCloseIntegrationClick={this.handleCloseIntegrationClick}
        setIntegration={this.props.setIntegration}
        handleSaveClick={this.props.handleSaveClick}
        updateDbFormIntegrations={this.props.updateDbFormIntegrations}
        savedForm={savedForm}
        form={form}
        integrationValue={integrationValue}
        activeStatus={activeStatus}
        integrationObject={integrationObject}
      />
    )
  }

  render() {
    const integrationList = this.getIntegrationMetaData()
    const { selectedIntegration } = this.state
    return (
      <div
        className={
          'integrationsWrapper' + (selectedIntegration ? ' open' : '')
        }>
        <div className="integrationsMessage">
          Integrate your form with other services
        </div>
        <div className="integrationsList">
          {integrationList
            .filter((integration) =>
              this.removeUnavailableIntegrations(integration)
            )
            .map((item, key) => (
              <div
                className={
                  selectedIntegration === item.displayText.replaceAll(' ', '')
                    ? 'integration active'
                    : 'integration'
                }
                key={key}
                onClick={() => this.handleOpenIntegrationClick(item)}>
                <img alt="logo" src={item.icon} className="logo" />
                <div className="title">{item.displayText}</div>
                {item.activeStatus === true && item.paused === false ? (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="activeStatus"
                  />
                ) : null}
                {item.activeStatus === true && item.paused === true ? (
                  <FontAwesomeIcon
                    icon={faPauseCircle}
                    className="activeStatus"
                  />
                ) : null}
              </div>
            ))}
        </div>
        <div className="integration-display-right">
          {this.state.selectedIntegration
            ? this.setRenderedIntegration()
            : null}
        </div>
      </div>
    )
  }
}

const FormIntegrationsWrapped = (props) => (
  <GeneralContext.Consumer>
    {(value) => <FormIntegrations {...props} generalContext={value} />}
  </GeneralContext.Consumer>
)

export default FormIntegrationsWrapped
