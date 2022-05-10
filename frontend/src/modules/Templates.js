import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import TemplatePlaceholder from '../svg/TemplatePlaceholder'
import { api } from '../helper'

import './Templates.css'

const BACKEND = process.env.REACT_APP_BACKEND

class Templates extends Component {
  constructor(props) {
    super(props)

    this.state = {
      templates: [],
      selectedTemplate: {},
      filterText: ''
    }
  }

  async componentDidMount() {
    const { data } = await api({ resource: `/api/get/templates` })

    const templates = data

    if (templates.length > 0) {
      this.setState({ templates })
    } else {
      console.error('No templates found')
    }

    const url = window.location.pathname.split('/')
    const title = decodeURIComponent(url[url.indexOf('template') + 1])
    const externalCloneCommand = url.includes('clone')

    if (title !== 'undefined') {
      const selectedTemplate = templates.find((t) => t.title === title)
      this.setState({ selectedTemplate })
      if (externalCloneCommand) {
        this.setState({ templateToBeCloned: selectedTemplate })
      }
    } else {
      this.setState({ selectedTemplate: templates[0] })
    }

    const iframe = document.getElementById('template-iframe')
    iframe.onload = function () {
      iframe.classList.add('iframe-ready')
    }
  }

  handleFilterTextChange = (e) => {
    this.setState({
      filterText: e.target.value
    })
  }

  handleTemplateSelect = (template) => {
    const selectedTemplate = template
    const thisTemplateCard = document.getElementById(
      `tpl-${selectedTemplate.id}`
    )
    if (thisTemplateCard.classList.contains('selected')) {
      return null
    }
    const iframe = document.getElementById('template-iframe')
    this.setState({ selectedTemplate })
    iframe.classList.remove('iframe-ready')
  }

  filterAndCount = (category) => {
    const { templates } = this.state
    const filterText = this.state.filterText.toLowerCase()

    const templateGroup = templates.filter(
      (template) =>
        template.props.tags[0] === category &&
        template.title.toLowerCase().indexOf(filterText) !== -1
    )

    return templateGroup.length
  }

  render() {
    if (this.state.templateToBeCloned) {
      this.props.cloneTemplate(this.state.templateToBeCloned)
    }
    const { templates, selectedTemplate } = this.state
    const filterText = this.state.filterText.toLowerCase()
    const templatesMainContent = []
    let lastCategory = null

    templates.forEach((template) => {
      let category = template.props.tags[0]
      if (category === undefined || '') {
        category = 'Other'
      }
      let templateCount = this.filterAndCount(category)
      if (category !== lastCategory) {
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
      }
      templatesMainContent.push(
        <NavLink
          key={template.id}
          to={`/editor/new/template/${template.title}`}
          id={`tpl-${template.id}`}
          className={`template-card ${
            template.title.toLowerCase().indexOf(filterText) === -1 ? ' dn' : ''
          } ${selectedTemplate.id === template.id ? 'selected' : ''}`}
          onClick={() => this.handleTemplateSelect(template)}>
          <div className="screen">
            <TemplatePlaceholder className="template-placeholder" />
          </div>
          <div key={template.id} className="template-info">
            <div className="template-title">{template.title}</div>
          </div>
        </NavLink>
      )
      lastCategory = category
    })

    return (
      <div className="template-component-wrapper">
        <div className="leftColumn">
          <div className="templates-title">Templates</div>
          <input
            type="text"
            className="search-box"
            placeholder="Search templates..."
            value={this.state.filterText}
            onChange={this.handleFilterTextChange}
          />
          <div className="templates-wrapper">{templatesMainContent}</div>
        </div>

        <div className="rightColumn">
          <div className="selected-template-title">
            {this.state.selectedTemplate.title}
            <button
              className="cloneButton"
              onClick={() =>
                this.props.cloneTemplate(this.state.selectedTemplate)
              }>
              {' '}
              Clone Template!{' '}
            </button>
          </div>
          <div className="selected-template-wrapper">
            <iframe
              id={'template-iframe'}
              src={`${BACKEND}/templates/view/${selectedTemplate.id}`}
              title={`FP_FORM_${selectedTemplate.id}`}
              className={'template-iframe'}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default Templates
