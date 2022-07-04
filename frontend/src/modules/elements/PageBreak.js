import React, { Component } from 'react'

import ElementContainer from '../common/ElementContainer'
import EditableLabel from '../common/EditableLabel'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'

import './PageBreak.css'

export default class PageBreak extends Component {
  static weight = 14

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
    displayText: 'Page Break'
  }

  render() {
    const { config, mode } = this.props

    const inputProps = {}

    if (typeof config.onClick !== 'undefined') {
      inputProps.onClick = config.onClick
    }

    const builderNextButton = (
      <div className="pagebreak-button pb-next">
        <button {...inputProps}>
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

    const builderPreviousButton = (
      <div className="pagebreak-button pb-previous">
        <button {...inputProps}>
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

    const builderSubmitButton = (
      <div className="pagebreak-button pb-submit">
        <button {...inputProps}>
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

    const rendererNextButton = (
      <div className="pagebreak-button pagebreak-next">
        <input
          {...inputProps}
          type="button"
          className="pb-next"
          value={config.nextButtonText}
          data-currentPage={config.pageNumber}></input>
      </div>
    )

    const rendererPreviousButton = (
      <div className="pagebreak-button pagebreak-previous">
        <input
          {...inputProps}
          type="button"
          className="pb-previous"
          value={config.previousButtonText}
          data-currentPage={config.pageNumber}></input>
      </div>
    )

    const rendererSubmitButton = (
      <div className="pagebreak-button pagebreak-submit">
        <input
          {...inputProps}
          type="submit"
          className="pb-submit"
          value={config.submitButtonText}
          data-currentPage={config.pageNumber}></input>
      </div>
    )

    let display
    if (mode === 'builder') {
      switch (config.style) {
        case 'start':
          display = (
            <div className="pagebreak-navControls">{builderNextButton}</div>
          )
          break
        case 'end':
          display = (
            <div className="pagebreak-navControls">
              {builderPreviousButton}
              {builderSubmitButton}
            </div>
          )
          break
        case 'between':
          display = (
            <div className="pagebreak-navControls">
              {builderPreviousButton}
              {builderNextButton}
            </div>
          )
          break
      }
    } else {
      switch (config.style) {
        case 'start':
          display = (
            <div className="pagebreak-navControls">{rendererNextButton}</div>
          )
          break
        case 'end':
          display = (
            <div className="pagebreak-navControls">
              {rendererPreviousButton}
              {rendererSubmitButton}
            </div>
          )
          break
        case 'between':
          display = (
            <div className="pagebreak-navControls">
              {rendererPreviousButton}
              {rendererNextButton}
            </div>
          )
          break
      }
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        <hr className="pagebreak-separator" />
        {display}
        <span className="pagebreak-pageCount">
          {config.pageNumber}/{config.maxPages}
        </span>
      </ElementContainer>
    )
  }
}
