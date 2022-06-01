import React, { Component } from 'react'

import ElementContainer from '../common/ElementContainer'

import './PageBreak.css'
import EditableLabel from '../common/EditableLabel'

export default class PageBreak extends Component {
  static weight = 12

  static defaultConfig = {
    id: 0,
    type: 'PageBreak',
    nextButtonText: 'Next',
    previousButtonText: 'Previous',
    submitButtonText: 'Submit!',
    style: 'start'
  }

  render() {
    const { config, mode } = this.props

    const inputProps = {}

    if (typeof config.onClick !== 'undefined') {
      inputProps.onClick = config.onClick
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        <hr className="pagebreak-separator" />
        <div className="pagebreak-navControls">
          {mode === 'builder' ? (
            config.style === 'start' ? (
              <div className="pagebreak-button pb-next">
                <button {...inputProps}>
                  <EditableLabel
                    className="fl label"
                    dataPlaceholder="Type a button text"
                    mode={mode}
                    labelKey={`pbButton_${config.id}_next`}
                    handleLabelChange={this.props.handleLabelChange}
                    value={config.nextButtonText}
                  />
                </button>
              </div>
            ) : config.style === 'between' ? (
              <div>
                <div className="pagebreak-button pb-previous">
                  <button {...inputProps}>
                    <EditableLabel
                      className="fl label"
                      dataPlaceholder="Type a button text"
                      mode={mode}
                      labelKey={`pbButton_${config.id}_previous`}
                      handleLabelChange={this.props.handleLabelChange}
                      value={config.previousButtonText}
                    />
                  </button>
                </div>
                <div className="pagebreak-button pb-next">
                  <button {...inputProps}>
                    <EditableLabel
                      className="fl label"
                      dataPlaceholder="Type a button text"
                      mode={mode}
                      labelKey={`pbButton_${config.id}_next`}
                      handleLabelChange={this.props.handleLabelChange}
                      value={config.nextButtonText}
                    />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="pagebreak-button pb-previous">
                  <button {...inputProps}>
                    <EditableLabel
                      className="fl label"
                      dataPlaceholder="Type a button text"
                      mode={mode}
                      labelKey={`pbButton_${config.id}_previous`}
                      handleLabelChange={this.props.handleLabelChange}
                      value={config.previousButtonText}
                    />
                  </button>
                </div>
                <div className="pagebreak-button pb-submit">
                  <button {...inputProps}>
                    <EditableLabel
                      className="fl label"
                      dataPlaceholder="Type a button text"
                      mode={mode}
                      labelKey={`pbButton_${config.id}_submit`}
                      handleLabelChange={this.props.handleLabelChange}
                      value={config.submitButtonText}
                    />
                  </button>
                </div>
              </div>
            )
          ) : config.style === 'start' ? (
            <div className="pagebreak-button pagebreak-next">
              <input
                {...inputProps}
                type="button"
                className="pb-next"
                value={config.nextButtonText}
                data-currentPage={config.pageNumber}></input>
            </div>
          ) : config.style === 'between' ? (
            <div>
              <div className="pagebreak-button pagebreak-previous">
                <input
                  {...inputProps}
                  type="button"
                  className="pb-previous"
                  value={config.previousButtonText}
                  data-currentPage={config.pageNumber}></input>
              </div>
              <div className="pagebreak-button pagebreak-next">
                <input
                  {...inputProps}
                  type="button"
                  className="pb-next"
                  value={config.nextButtonText}
                  data-currentPage={config.pageNumber}></input>
              </div>
            </div>
          ) : (
            <div>
              <div className="pagebreak-button pagebreak-previous">
                <input
                  {...inputProps}
                  type="button"
                  className="pb-previous"
                  value={config.previousButtonText}
                  data-currentPage={config.pageNumber}></input>
              </div>
              <div className="pagebreak-button pagebreak-submit">
                <input
                  {...inputProps}
                  type="submit"
                  className="pb-submit"
                  value={config.submitButtonText}
                  data-currentPage={config.pageNumber}></input>
              </div>
            </div>
          )}
        </div>
        <span className="pagebreak-pageCount">
          {config.pageNumber}/{config.maxPages}
        </span>
      </ElementContainer>
    )
  }
}
