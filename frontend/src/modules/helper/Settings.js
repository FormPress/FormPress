import React, { Component } from 'react'
import { NavLink, Switch, Route, Redirect } from 'react-router-dom'
import PrivateRoute from '../../PrivateRoute'
import './Settings.css'
import { api } from '../../helper'

export default class Settings extends Component {
  constructor(props) {
    super(props)
    this.state = {
      navLinks: [],
      routes: [],
      planNames: ['silver', 'gold', 'diamond'],
      key: '-'
    }
  }

  async componentDidMount() {
    const { data } = await api({
      resource: `/api/app/get/settingsPluginfileslist`
    })
    const key = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/api-key`
    })

    this.setState({ userListIsloaded: true, key: key.data[0].api_key, data })

    const navLinks = [],
      routes = [
        <Route exact path="/settings" key="changepassword">
          <Redirect to="/settings/changepassword" />
        </Route>
      ]

    for (const file of data) {
      await import('../settings/' + file).then((module) => {
        navLinks.push(
          <NavLink
            key={module.default.menuText}
            exact
            to={module.default.path}
            activeClassName="selected">
            {module.default.menuText}
          </NavLink>
        )
        routes.push(
          <PrivateRoute
            exact
            path={module.default.path}
            component={module.default}
            key={module.default.menuText}
          />
        )
        if (module.default.menuText === 'Billing') {
          this.state.planNames.forEach((item) => {
            routes.push(
              <PrivateRoute
                exact
                path={`/settings/billing/${item}`}
                component={module.default}
                key={item}
              />
            )
          })
        }
      })
    }

    routes.push(<Redirect path="*" to="/404" key={routes.length + 1} />)

    this.setState({
      navLinks,
      routes
    })
  }

  render() {
    const { navLinks, routes } = this.state

    return (
      <div className="settings_container">
        <div className="content">
          <div className="settings_menu">
            <div className="settings_header">User settings</div>
            {navLinks}
          </div>
          <div className="settings_content">
            <Switch>{routes}</Switch>
          </div>
        </div>
      </div>
    )
  }
}
