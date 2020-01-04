import React, { Component } from 'react';
import * as Elements from './elements'
import Renderer from './Renderer'

import './Builder.css'
let counter = 0
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
      insertBefore: false,
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
    this.handleDragOver = this.handleDragOver.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
    this.handleDragEnd = this.handleDragEnd.bind(this)
  }



  handleDragStart (item, e) {
    console.log('DRAG STARTED ', e, item)
    e.dataTransfer.setData('text/plain', item.type)
    this.setState({dragging: true})
  }

  handleDragEnter (e, elem) {
    //console.log('Drag enter ', elem)
  }

  handleDragLeave (e, elem) {
    // drag leave
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

    const index = form.elements.findIndex(
      (element) => (element.id.toString() === dragIndex)
    )

    let newElements

    if (this.state.insertBefore === true) {
      newElements = [
        ...form.elements.slice(0, index),
        item,
        ...form.elements.slice(index)
      ]
    } else {
      newElements = [
        ...form.elements.slice(0, index + 1),
        item,
        ...form.elements.slice(index + 1)
      ]
    }

    this.setState({
      dragging: false,
      dragIndex: false,
      form: {
        ...form,
        elements: newElements
      }
    })
  }

  handleDragEnd (e) {
    this.setState({dragging: false})
  }

  handleDragOver (e, elem) {
    //console.log('DRAG OVER')
    const rect = e.target.getBoundingClientRect()
    const {left, top, height} = rect
    const {clientY} = e
    const id = e.target.id
    const middleTop = top + height / 2
    const diff = clientY - middleTop
    const insertBefore = (diff < 0)

    if (
      id !== '' &&
      (
        id !== this.state.dragIndex.toString() ||
        insertBefore !== this.state.insertBefore
      )
    ) {
      this.setState({
        dragIndex: id,
        insertBefore
      })
    }

    e.stopPropagation()
    e.preventDefault()
  }

  render () {
    return (
      <div className='builder center'>
        <div className='header'>Welcome to builder!</div>
        <div className='content oh'>
          <div className='fl elements'>
            <div className='elementsContent'>
              <div>Form Elements</div>
              <div className='elementList'>
                {pickerElements.map((elem) =>
                  <div
                    className='element'
                    draggable
                    onDragStart={ this.handleDragStart.bind(this, elem) }
                    onDragEnd={ this.handleDragEnd }
                    key={ elem.type }
                  >
                    {elem.type}
                  </div>
                )}
              </div>
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
            insertBefore={ this.state.insertBefore }
            form={ this.state.form }
          />
        </div>
      </div>
    );
  }
}
