import React, { Component } from 'react'
import Renderer from '../Renderer'

export default class QuestionProperties extends Component {
  constructor (props) {
    super(props)

    this.handleFieldChange = this.handleFieldChange.bind(this)
  }

  handleFieldChange (elem, e) {
    
  }

  render() {
    return <div>
      <h2>Question Properties</h2>
      <Renderer
        handleFieldChange={ this.handleFieldChange }
        form={{
          props: {
            elements: [
              {
                id: 1,
                type: 'Text',
                label: 'SIKKO',
                value: ''
              }
            ]
          }
        }}
      />
    </div>
  }
}
