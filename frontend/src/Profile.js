import React from 'react'
import { NavLink } from 'react-router-dom'

import AuthContext from './auth.context'
import { ProfileSVG } from './svg'
import './Profile.css'

const Profile = () => {
  const logout = (e) => {
    e.preventDefault()
    window.localStorage.removeItem('auth')
    window.localStorage.removeItem('lastEditedFormId')
    window.location.reload()
  }

  const renderLoggedIn = (auth) => {
    return [
      <div key="1" className="wrapper-welcome">
        <div className="welcome-user" key="2">
          Welcome, <i title={auth.email}>{auth.email}</i>
        </div>
        <ProfileSVG
          key="3"
          className="profileSVG"
          title="Log out"
        />
        <NavLink to="/settings" activeClassName="selected">
          Settings
        </NavLink>
        <a onClick={logout}>Logout</a>
      </div>
    ]
  }

  return (
    <AuthContext.Consumer>
      {(value) => {
        return value.loggedIn === true ? renderLoggedIn(value) : null
      }}
    </AuthContext.Consumer>
  )
}

export default Profile
