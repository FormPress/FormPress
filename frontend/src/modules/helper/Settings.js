import React, { Component } from 'react'
import { NavLink, Switch, Route } from 'react-router-dom'
import './Settings.css'
import { api } from '../../helper'

class Settings extends Component {
  state = {
    settingComponents: []
  }
  async componentDidMount() {
    const { data } = await api({
      resource: `/api/app/get/settingsPluginfileslist`
    })

    data.forEach((file) => {
      import('../settings/' + file).then((module) => {
        const newSettingComponents = [
          ...this.state.settingComponents,
          {
            path: module.default.path,
            text: module.default.menuText,
            component: module.default
          }
        ]

        this.setState({
          settingComponents: newSettingComponents
        })
      })
    })
  }
  render() {
    return (
      <div className="settings_container">
        <div className="content">
          <div className="settings_menu">
            <h2>User settings</h2>
            {this.state.settingComponents.map((item, key) => (
              <NavLink
                key={key}
                exact
                to={item.path}
                activeClassName="selected">
                {item.text}
              </NavLink>
            ))}
          </div>
          <div className="settings_content">
            <Switch>
              {this.state.settingComponents.map((item, key) => (
                <Route path={item.path} component={item.component} key={key} />
              ))}
            </Switch>
          </div>
        </div>
      </div>
    )
  }
}

export default Settings
