import React, { Component } from 'react'
import Renderer from '../../Renderer'

export default class CustomCSS extends Component {
  constructor(props) {
    super(props)

    this.handleCustomCSSTextChange = this.handleCustomCSSTextChange.bind(this)
  }

  handleCustomCSSTextChange(elem, e) {
    this.props.setCSS({
      value: e.target.value,
      isEncoded: false
    })
  }

  render() {
    let customCSS = ''

    if (this.props.form.props.customCSS !== undefined) {
      customCSS = this.props.form.props.customCSS.value
    }

    return (
      <div>
        <div className="shareFormMessage">
          Custom CSS is an advanced feature. Incorrect use{' '}
          <strong>may break the form</strong> and cause it to{' '}
          <strong>not render correctly</strong>. Please use with caution.
        </div>
        <Renderer
          handleFieldChange={this.handleCustomCSSTextChange}
          theme="infernal"
          form={{
            props: {
              elements: [
                {
                  id: 4,
                  type: 'TextArea',
                  label: 'Custom CSS',
                  value: customCSS
                }
              ]
            }
          }}
        />
      </div>
    )
  }
}
