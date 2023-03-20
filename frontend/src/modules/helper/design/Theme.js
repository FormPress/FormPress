import React, { Component } from 'react'

export default class Theme extends Component {

  render () {
    const themeList = [
      {
        name: 'gleam',
        displayText: 'Gleam'
      },
      {
        name: 'comet',
        displayText: 'Comet'
      }
    ]
    return (
      <div>
        {themeList.map( (item, index) => (
          <div className={`themeSelect ${this.props.theme === item.name ? "selectedTheme" : ""}`} key={index} onClick={()=>this.props.setTheme(item.name)}>
            {item.displayText}
          </div>
        ))}
      </div>
    )
  }
}