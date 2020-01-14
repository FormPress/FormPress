import React, { Component } from 'react';
import * as Elements from './elements'

export default class Renderer extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    let { className } = this.props

    if (this.props.dragging === true) {
      className += ' dragging'
    }

    return <div
      className={ className }
      onDrop={ this.props.handleDrop }
      onDragEnter={(e) => this.props.handleDragEnter(e, 'container')}
      onDragLeave={(e) => this.props.handleDragLeave(e, 'container')}
      onDragOver={ this.props.handleDragOver }
    >
    {this.props.form.props.elements.map((elem, index) => {
      const Component = Elements[elem.type]
      const renderList = [
        <Component
          key={ index }
          id={ elem.id }
          props={ elem }
          onDrop={ this.props.handleDrop }
          onDragOver={ (e) => this.props.handleDragOver(e, elem) }
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
