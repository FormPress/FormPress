import React, { Component } from 'react';
import {ElementInput} from './ElementInput'
import {ElementButton} from './ElementButton'
import './Builder.css'

const elements = [
  {type: 'input'},
  {type: 'button'}
]

const elementComponents = {
  ElementInput,
  ElementButton
}


export class Builder extends Component {
  constructor(props) {
    super(props)
    this.state = {
      counter: 0,
      form: {
        elements: [
          {
            type: 'ElementInput',
            label: 'First Name'
          },
          {
            type: 'ElementButton',
            value: 'Submit'
          }
        ]
      }
    }
    //this.handleClick = this.handleClick.bind(this)
  }
  render() {
    return (
      <div className='builder'>
        <div className='header'>Welcome to builder!</div>
        <div className='content oh'>
          <div className='fl elements'>
            <div>Form Elements</div>
            <div>
              {elements.map((elem) => 
                <div>
                  {elem.type}
                </div>
              )}
            </div>
          </div>
          <div className='fl form'>
            {this.state.form.elements.map((elem) => {
              const Component = elementComponents[elem.type] 

              return <Component { ...elem }/>
            })}
          </div>
        </div>
      </div>
    );
  }
}
