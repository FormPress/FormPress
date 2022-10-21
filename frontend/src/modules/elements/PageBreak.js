import React, { Component } from 'react'

import ElementContainer from '../common/ElementContainer'
import EditableLabel from '../common/EditableLabel'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'

import './PageBreak.css'

export default class PageBreak extends Component {
  static weight = 15

  static defaultConfig = {
    id: 0,
    type: 'PageBreak',
    nextButtonText: 'Next',
    previousButtonText: 'Previous',
    submitButtonText: 'Submit',
    style: 'start'
  }

  static metaData = {
    icon: faPlusCircle,
    displayText: 'Page Break',
    group: 'pageElement'
  }

  render() {
    const { config, mode } = this.props

    const inputProps = {}

    if (typeof config.onClick !== 'undefined') {
      inputProps.onClick = config.onClick
    }

    const nextButton = (
      <div className="pagebreak-button pb-next">
        <button
          type="button"
          className="pb-next"
          data-currentpage={config.pageNumber}
          {...inputProps}>
          <EditableLabel
            className="fl label"
            dataPlaceholder="Type a button text"
            mode={config.autoPageBreak ? 'viewer' : mode}
            labelKey={`pbButton_${config.id}_next`}
            handleLabelChange={this.props.handleLabelChange}
            value={config.nextButtonText}
          />
        </button>
      </div>
    )

    const previousButton = (
      <div className="pagebreak-button pb-previous">
        <button
          type="button"
          className="pb-previous"
          data-currentpage={config.pageNumber}
          {...inputProps}>
          <EditableLabel
            className="fl label"
            dataPlaceholder="Type a button text"
            mode={config.autoPageBreak ? 'viewer' : mode}
            labelKey={`pbButton_${config.id}_previous`}
            handleLabelChange={this.props.handleLabelChange}
            value={config.previousButtonText}
          />
        </button>
      </div>
    )

    const submitButton = (
      <div className="pagebreak-button pb-submit">
        <button type="submit" className="pb-submit" {...inputProps}>
          <EditableLabel
            className="fl label"
            dataPlaceholder="Type a button text"
            mode={config.autoPageBreak ? 'viewer' : mode}
            labelKey={`pbButton_${config.id}_submit`}
            handleLabelChange={this.props.handleLabelChange}
            value={config.submitButtonText}
          />
        </button>
      </div>
    )

    let display
    switch (config.style) {
      case 'start':
        display = <div className="pagebreak-navControls">{nextButton}</div>
        break
      case 'end':
        display = (
          <div className="pagebreak-navControls">
            {previousButton}
            {submitButton}
          </div>
        )
        break
      case 'between':
        display = (
          <div className="pagebreak-navControls">
            {previousButton}
            {nextButton}
          </div>
        )
        break
      default:
        display = <div className="pagebreak-navControls">{nextButton}</div>
        break
    }

    const options = []
    for (let i = 1; i <= parseInt(config.maxPages); i++) {
      options.push(
        <option key={i} value={i}>
          {i}
        </option>
      )
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        <hr className="pagebreak-separator" />
        {display}
        <span className="pagebreak-pageCount">
          <span className="currentPageSelector">
            <select
              className="currentPageSelector-select"
              data-currentpage={config.pageNumber}
              value={config.pageNumber}>
              {options}
            </select>
            &nbsp;
          </span>
          /&nbsp;
          {config.maxPages}
        </span>
      </ElementContainer>
    )
  }
}
