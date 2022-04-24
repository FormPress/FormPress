import React, { Component } from 'react'
import { NavLink, Switch, Route } from 'react-router-dom'
import AuthContext from '../../auth.context'
import Roles from './Roles'
import User from './User'
import Status from './Status'

import './AdminPage.css'

//api/server/capabilities for status tab
class AdminPage extends Component {
  renderAdminContent() {
    return (
      <Switch>
        <Route path="/admin/users"><User /></Route>
        <Route path="/admin/roles"><Roles /></Route>
        <Route path="/admin/status"><Status /></Route>
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
        name: 'roles',
        text: 'Status',
        path: '/admin/status'
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

const AdminPageWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <AdminPage {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default AdminPageWrapped
