import React, { Component } from 'react'
import { NavLink, Switch, Route, Redirect } from 'react-router-dom'
import Roles from './Roles'
import Users from './Users'
import Status from './Status'
import Whitelist from './Whitelist'
import Evaluation from './Evaluation'

import './AdminPage.css'

export default class AdminPage extends Component {
  renderAdminContent() {
    return (
      <Switch>
        <Route exact path="/admin">
          <Redirect to="/admin/users" />
        </Route>
        <Route exact path="/admin/users">
          <Users />
        </Route>
        <Route exact path="/admin/roles">
          <Roles />
        </Route>
        <Route exact path="/admin/status">
          <Status />
        </Route>
        <Route exact path="/admin/whitelist">
          <Whitelist />
        </Route>
        <Route exact path="/admin/evaluation">
          <Evaluation />
        </Route>
        <Redirect path="*" to="/404" />
      </Switch>
    )
  }
  render() {
    const tabs = [
      {
        name: 'users',
        text: 'Users',
        path: `/admin/users`
      },
      {
        name: 'roles',
        text: 'Roles',
        path: `/admin/roles`
      },
      {
        name: 'whitelist',
        text: 'Whitelist',
        path: '/admin/whitelist'
      },
      {
        name: 'status',
        text: 'Status',
        path: '/admin/status'
      },
      {
        name: 'evaluation',
        text: 'Evaluation',
        path: '/admin/evaluation'
      }
    ]
    return (
      <div className="adminpage">
        <div className="headerContainer">
          <div className="header grid center">
            <div className="col-16-16 mainTabs">
              {tabs.map((item, key) => (
                <NavLink
                  key={key}
                  exact
                  to={`${item.path}`}
                  activeClassName="selected">
                  {item.text}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
        {this.renderAdminContent()}
      </div>
    )
  }
}
