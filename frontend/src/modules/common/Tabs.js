import React, { Component } from 'react'

import './Tabs.css'

export default class Tabs extends Component {
  handleTabClick (item, e) {
    e.preventDefault()
    this.props.setActiveTab(item.name)
  }

  render() {
    let { activeTab } = this.props
    const items = this.props.items.filter((item) => (item !== null))

    if (activeTab === false && items.length > 0) {
      activeTab = items[0].name
    }

    const ActiveTab = items
      .filter((item) => item.name === activeTab)[0]

    let activeTabContent = (typeof ActiveTab.content !== 'undefined')
      ? ActiveTab.content
      : <ActiveTab.component { ...ActiveTab.props }/>

    return (
      <div className={ `tabsContainer ${this.props.className}` }>
        <div className='tabs'>
          {
            items.map((item, key) => 
              <a
                href='#/'
                key={ key }
                onClick={ this.handleTabClick.bind(this, item) }
                className={
                  (item.name === activeTab) ? 'selected' : undefined
                }
              >
                { item.text }
              </a>
            )
          }
        </div>
        <div className='content'>
          { activeTabContent }
        </div>
      </div>
    )
  }
}