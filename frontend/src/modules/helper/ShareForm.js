import React, { Component } from 'react'
import ShareFormLeftTab from './ShareFormTabs/ShareFormLeftTab'
import ShareFormRightTab from './ShareFormTabs/ShareFormRightTab'

import './ShareForm.css'

class ShareForm extends Component {
  render() {
    const embedCode = [
      `<script src="${this.props.backEnd}/runtime/embed.js">`,
      '</script>'
    ].join('\n')
    return (
      <div className="col-15-16 shareForm">
        <ShareFormLeftTab
          embedCode={embedCode}
          backEnd={this.props.backEnd}
          formId={this.props.formId}
        />
        <ShareFormRightTab />
      </div>
    )
  }
}

export default ShareForm
