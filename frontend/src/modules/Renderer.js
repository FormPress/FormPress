import React, { Component } from 'react'
import * as Elements from './elements'

export default class Renderer extends Component {
  static defaultProps = {
    mode: 'viewer'
  }

  render () {
    let { className, ddHandlers } = this.props

    if (this.props.dragging === true) {
      className += ' dragging'
    }

    return <div
      className={ className }
      { ...ddHandlers }
    >
    {this.props.form.props.elements.map((elem, index) => {
      const Component = Elements[elem.type]
      const extraProps = { mode: this.props.mode }

      if (typeof this.props.handleFieldChange === 'function') {
        extraProps.onChange = (e) => {
          this.props.handleFieldChange(elem, e)
        }
      }

      const renderList = [
        <Component
          key={ index }
          id={ elem.id }
          config={ elem }
          ddHandlers={ this.props.ddHandlers }
          handleLabelChange={ this.props.handleLabelChange }
          { ...extraProps }
        />
      ]

      if (
        this.props.dragIndex === elem.id.toString() &&
        this.props.dragging === true
      ) {
        if (this.props.insertBefore === true) {
          renderList.unshift(
            <div key='dropPlaceHolder' className='dropPlaceHolder'></div>
          )
        } else {
          renderList.push(
            <div key='dropPlaceHolder' className='dropPlaceHolder'></div>
          )
        }
      }

      return (renderList.length === 1) ? renderList[0] : renderList

    })}
    </div>
  }
}
