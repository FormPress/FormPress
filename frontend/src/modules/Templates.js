import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { api } from '../helper'

import './Templates.css'

export default class Templates extends Component {
  constructor(props) {
    super(props)

    this.state = {
      initializing: true,
      templates: [],
      categories: [],
      selectedTemplate: {},
      filterText: '',
      expandTemplate: null
    }
  }

  async componentDidMount() {
    const { data: templateListResult } = await api({
      resource: `/api/get/templates`
    })

    const { data: templateMetrics } = await api({
      resource: `/api/templates/metrics`
    })

    const nextState = {}

    const templates = templateListResult.map(
      // add timesCloned to each template
      (template) => {
        const templateMetric = templateMetrics.find(
          (metric) => metric.id === template.id
        )
        return {
          ...template,
          timesCloned: templateMetric?.times_cloned || 0
        }
      }
    )

    if (templates.length > 0) {
      let categories = templates.map((template) => {
        return template.category || 'Other'
      })

      // avoid duplicates
      categories = Array.from(new Set(categories))

      nextState.templates = templates
      nextState.categories = categories
    } else {
      console.error('No templates found')
    }

    const url = window.location.pathname.split('/')
    const id = decodeURIComponent(url[url.indexOf('templates') + 1])
    const queryParams = new URLSearchParams(window.location.search)
    const externalCloneCommand = queryParams.get('clone')

    if (id !== 'undefined') {
      const selectedTemplate = templates.find((t) => t.id === parseInt(id))
      nextState.selectedTemplate = selectedTemplate
      if (externalCloneCommand) {
        nextState.cloneRequested = true
      }
    } else {
      nextState.selectedTemplate = null
    }

    nextState.initializing = false
    this.setState(nextState)
  }

  handleFilterTextChange = (e) => {
    this.setState({
      filterText: e.target.value
    })
  }

  handleTemplateSelect = (template) => {
    let { selectedTemplate, expandTemplate } = this.state

    if (expandTemplate === null && selectedTemplate !== null) {
      return
    }

    this.props.history.push(
      `/editor/new/templates/${template.id}/${template.url_title}`
    )

    selectedTemplate = template
    this.setState({ selectedTemplate, expandTemplate: true })
  }

  handleTemplateDeselect = () => {
    this.props.history.push('/editor/new/templates')
    this.setState({ expandTemplate: null }, () => {
      setTimeout(() => {
        this.setState({ selectedTemplate: null })
      }, 700)
    })
  }

  filterAndCount = (category) => {
    const { templates } = this.state
    const filterText = this.state.filterText.toLowerCase()

    const templateGroup = templates.filter(
      (template) =>
        template.category === category &&
        template.title.toLowerCase().indexOf(filterText) !== -1
    )

    return templateGroup.length
  }

  render() {
    if (this.state.initializing === true) {
      return null
    }

    if (this.state.cloneRequested === true) {
      this.props.cloneTemplate(this.state.selectedTemplate)
      return null
    }

    const { templates, selectedTemplate, categories } = this.state
    const filterText = this.state.filterText.toLowerCase()
    const templatesMainContent = []
    let visibleTemplateCount = null

    categories.forEach((category) => {
      let templateCount = this.filterAndCount(category)

      if (visibleTemplateCount === null) {
        visibleTemplateCount = templateCount
      } else {
        visibleTemplateCount += templateCount
      }

      templatesMainContent.push(
        <div
          key={category}
          className="template-group"
          style={
            templateCount > 0
              ? { display: 'inline-block' }
              : { display: 'none' }
          }>
          {category} Forms{' '}
          <span className="template-count">{templateCount}</span>
        </div>
      )
      templates.forEach((template) => {
        if (template.category === category) {
          templatesMainContent.push(
            <div
              key={template.id}
              id={`tpl-${template.id}`}
              className={`template-card ${
                template.title.toLowerCase().indexOf(filterText) === -1
                  ? ' dn'
                  : ''
              }`}
              onClick={() => this.handleTemplateSelect(template)}>
              <div className="screen">
                <img
                  src={`https://static.formpress.org/images/templates/tpl-${template.id}.png`}
                  alt={template.title}
                />
              </div>
              <div key={template.id} className="template-info">
                <div className="template-title">{template.title}</div>
              </div>
            </div>
          )
        }
      })
    })

    return (
      <div className="template-component-wrapper">
        <div
          className={
            window.location.pathname.endsWith('/templates')
              ? 'main-screen'
              : 'main-screen expanded'
          }>
          <div className="templates-browser">
            <div className="templates-browser-header">
              <div className="templates-title">Templates</div>
              <input
                type="text"
                className="search-box"
                placeholder="Search templates..."
                value={this.state.filterText}
                onChange={this.handleFilterTextChange}
              />
            </div>
            <div className="templates-browser-content">
              {templatesMainContent}
              <div
                className="no-templates"
                style={
                  visibleTemplateCount === null || visibleTemplateCount > 0
                    ? { display: 'none' }
                    : { display: 'block' }
                }>
                No templates found
              </div>
            </div>
          </div>
          <div className="template-details">
            <div
              className="vertical-back"
              onClick={() => this.handleTemplateDeselect()}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </div>
            <div className="template-details-container">
              <div className="selected-template-title">
                {selectedTemplate?.title || 'Select a template'}
              </div>

              <div className="template-details-content">
                <div className="leftColumn">
                  <div className="template-category">
                    <span>Category: </span>
                    {selectedTemplate?.category || 'Other'}
                  </div>
                  <div className="template-creator">
                    <span>Created by: </span>
                    {selectedTemplate?.createdBy || 'FormPress Team'}
                  </div>
                  <div className="template-description">
                    <span>Description: </span>
                    {selectedTemplate?.description ||
                      'No description available'}
                  </div>
                  <div className="template-tags">
                    <span>Tags: </span>
                    {selectedTemplate?.props?.tags?.join(', ') || 'No tags'}
                  </div>

                  <div className="template-timescloned">
                    <span>Times cloned: </span>
                    {selectedTemplate?.timesCloned || 0}
                  </div>

                  <div className="template-actions">
                    <button
                      className="viewButton"
                      onClick={() =>
                        window.open(
                          `${global.env.FE_BACKEND}/templates/view/${selectedTemplate.id}`,
                          '_blank'
                        )
                      }>
                      {' '}
                      View in action{' '}
                    </button>
                    <button
                      className="cloneButton"
                      onClick={() =>
                        this.props.cloneTemplate(this.state.selectedTemplate)
                      }>
                      {' '}
                      Use Template{' '}
                    </button>
                  </div>
                </div>
                <div className="rightColumn">
                  <div className="selected-template-wrapper">
                    {selectedTemplate !== null &&
                    selectedTemplate.id !== undefined ? (
                      <img
                        src={`https://static.formpress.org/images/templates/tpl-${selectedTemplate.id}.png`}
                        alt={selectedTemplate.title}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
