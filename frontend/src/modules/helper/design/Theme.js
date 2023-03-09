import React, { Component } from 'react'

export default class Theme extends Component {
  constructor(props){
  super(props)
  }

  render () {
    const themeList = [
      {
        name: 'gleam',
        displayText: 'Gleam'
      },
      {
        name: 'testtheme',
        displayText: 'Test Theme'
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