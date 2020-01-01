import React, { Component } from 'react';
import * as Elements from './elements'
import Renderer from './Renderer'

import './Builder.css'

//Stuff that we render in left hand side
const getElements = () => Object.values(Elements).map((element) => Object
  .assign({}, element.defaultProps)
)
const getWeightedElements = () => Object
  .values(Elements)
  .map((element) => Object
    .assign({}, element.defaultProps, {weight: element.weight})
  )
const getElementsKeys = () => getElements()
  .reduce((acc, item) => {
    acc[item.type] = item

    return acc
  }, {})
const pickerElements = getWeightedElements()
  .sort((a, b) => a.weight - b.weight)

export class Builder extends Component {
  constructor (props) {
    super(props)
    this.state = {
      counter: 0,
      dragging: false,
      dragIndex: false,
      form: {
        elements: [
          {
            id: 1,
            type: 'Text',
            label: 'First Name'
          },
          {
            id: 2,
            type: 'Button',
            value: 'Submit'
          }
        ]
      }
    }
    //this.handleClick = this.handleClick.bind(this)
    this.handleDragStart = this.handleDragStart.bind(this)
    
    this.handleDragEnter = this.handleDragEnter.bind(this)
    this.handleDragLeave = this.handleDragLeave.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
    this.handleDragOver = this.handleDragOver.bind(this)
  }



  handleDragStart (item, e) {
    console.log('DRAG STARTED ', e, item)
    e.dataTransfer.setData('text/plain', item.type)
    this.setState({dragging: true})
  }

  handleDragEnter (e, elem) {
    console.log('DRAG ENTERED', elem)

    if (elem.id !== this.state.dragIndex) {
      this.setState({dragIndex: elem.id})
    }
  }

  handleDragLeave (e, elem) {
    //console.log('DRAG LEAVED', elem)
  }

  handleDrop (e) {
    console.log('Drop Happened')
    e.stopPropagation()
    e.preventDefault()
    
    const type = e.dataTransfer.getData('text')
    const item = getElementsKeys()[type]
    const { form, dragIndex } = this.state

    //set auto increment element id
    const maxId = Math.max(...form.elements.map((element) => element.id))

    item.id = maxId + 1

    console.log('Should insert after elem id => ', dragIndex)

    const index = form.elements.findIndex(
      (element) => (element.id === dragIndex)
    )
    console.log('IDS ', form.elements.map((element) => element.id), ' DRAGINDEX ', dragIndex, 'FOUND ARR INDEX ', index)
    this.setState({
      dragging: false,
      dragIndex: false,
      form: {
        ...form,
        elements: [
          ...form.elements.slice(0, index + 1),
          item,
          ...form.elements.slice(index + 1)
        ]
      }
    })
  }

  handleDragOver (e) {
    //console.log('DRAG OVER')
    e.stopPropagation()
    e.preventDefault()
  }

  render () {
    return (
      <div className='builder center'>
        <div className='header'>Welcome to builder!</div>
        <div className='content oh'>
          <div className='fl elements'>
            <div>Form Elements</div>
            <div className='elementList'>
              {pickerElements.map((elem) => 
                <div
                  className='element'
                  draggable
                  onDragStart={this.handleDragStart.bind(this, elem)}
                  key={elem.type}
                >
                  {elem.type}
                </div>
              )}
            </div>
          </div>
          <Renderer
            className='fl form'
            handleDragEnter={ this.handleDragEnter }
            handleDragLeave={ this.handleDragLeave }
            handleDrop={ this.handleDrop }
            handleDragOver={ this.handleDragOver }
            dragIndex={ this.state.dragIndex }
            dragging={ this.state.dragging }
            form={ this.state.form }
          />
        </div>
      </div>
    );
  }
}
