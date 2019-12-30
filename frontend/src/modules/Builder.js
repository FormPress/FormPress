import React, { Component } from 'react';
import * as Elements from './elements'

import './Builder.css'

//Stuff that we render in left hand side
const getElements = () => [
  { type: 'Text', label: 'First Name' },
  { type: 'Button', value: 'Submit' }
]
const getElementsKeys = () => getElements()
  .reduce((acc, item) => {
    acc[item.type] = item

    return acc
  }, {})
const elements = getElements()

export class Builder extends Component {
  constructor (props) {
    super(props)
    this.state = {
      counter: 0,
      form: {
        elements: [
          {
            type: 'Text',
            label: 'First Name'
          },
          {
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
  }

  handleDragEnter (e) {
    console.log('DRAG ENTERED')
  }

  handleDragLeave (e) {
    console.log('DRAG LEAVED')
  }

  handleDrop (e) {
    e.stopPropagation()
    e.preventDefault()
    console.log('Drop Happened')
    const type = e.dataTransfer.getData('text')
    const item = getElementsKeys()[type]
    const { form } = this.state

    this.setState({form: {
      ...form,
      elements: [
        ...form.elements,
        item
      ]
    }})
  }

  handleDragOver (e) {
    e.stopPropagation()
    e.preventDefault()
    console.log('DRAG OVER')
  }

  render () {
    return (
      <div className='builder center'>
        <div className='header'>Welcome to builder!</div>
        <div className='content oh'>
          <div className='fl elements'>
            <div>Form Elements</div>
            <div className='elementList'>
              {elements.map((elem) => 
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
          <div
            className='fl form'
            onDragEnter={this.handleDragEnter}
            onDragLeave={this.handleDragLeave}
            onDrop={this.handleDrop}
            onDragOver={this.handleDragOver}
          >
            {this.state.form.elements.map((elem, index) => {
              console.log('Elements ', Elements, elem.type)
              const Component = Elements[elem.type] 

              return <Component key={ index } { ...elem }/>
            })}
          </div>
        </div>
      </div>
    );
  }
}
