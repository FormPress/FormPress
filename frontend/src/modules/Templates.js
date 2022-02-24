import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import templates from '../templates/forms'
import TemplatePlaceholder from '../svg/TemplatePlaceholder'
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

  componentDidMount() {
    this.setState({ templates })

    const iframe = document.getElementById('template-iframe')
    iframe.onload = function () {
      iframe.classList.add('iframe-ready')
    }

    setTimeout(() => {
      const initialTemplate = document.getElementById(`tpl-1`)
      initialTemplate.click()
    }, 500)
  }

  handleFilterTextChange = (e) => {
    this.setState({
      filterText: e.target.value
    })
  }

  handleTemplateSelect = (template) => {
    const selectedTemplate = template
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
    const { templates, selectedTemplate } = this.state
    const filterText = this.state.filterText.toLowerCase()
    const templatesMainContent = []
    let lastCategory = null

    templates.forEach((template) => {
      let category = template.props.tags[0]
      if (category === undefined || '') {
        category = 'Other'
      }

      if (category !== lastCategory) {
        templatesMainContent.push(
          <div key={category} className="template-group">
            {category} Forms{' '}
            <span className="template-count">
              {this.filterAndCount(category)}
            </span>
          </div>
        )
      }
      templatesMainContent.push(
        <div
          key={template.id}
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
        </div>
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
            <NavLink
              to={{
                pathname: `/editor/${this.props.formId || 'new'}/builder`
              }}
              activeClassName="selected">
              <button
                className="cloneButton"
                onClick={() =>
                  this.props.cloneTemplate(this.state.selectedTemplate)
                }>
                {' '}
                Clone Template!{' '}
              </button>
            </NavLink>
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
