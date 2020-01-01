import React, { Component } from 'react';
import * as Elements from './elements'

export default class Renderer extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    console.log('Props Rendeer: ', this.props)
    return <div
      className={ this.props.className }
      onDrop={ this.props.handleDrop }
      onDragOver={ this.props.handleDragOver }
    >
    {this.props.form.elements.map((elem, index) => {
      console.log('Elements ', Elements, elem.type, this.props.dragIndex)
      const Component = Elements[elem.type] 

      const renderList = [
        <Component
          key={ index }
          props={ elem }
          onDrop={ this.props.handleDrop }
          onDragOver={ this.props.handleDragOver }
          onDragEnter={ (e) => this.props.handleDragEnter(e, elem) }
          onDragLeave={ (e) => this.props.handleDragLeave(e, elem) }
        />
      ]

      if (
        this.props.dragIndex === elem.id &&
        this.props.dragging === true
      ) {
        console.log('Will push')
        renderList.push(
          <div key='dropPlaceHolder' className='dropPlaceHolder'></div>
        )
      }
      console.log('Will return ', (renderList.length === 1) ? renderList[0] : renderList)
      return (renderList.length === 1) ? renderList[0] : renderList

    })}
    </div>
  }

}
