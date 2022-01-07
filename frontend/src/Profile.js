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
    return (
      <div className="profile">
        <div className="profileMenuContainer">
          <ProfileSVG key="1" className="profileSVG" />
          <div className="profileMenuContent dn">
            <NavLink to="/settings" activeClassName="selected">
              Settings
            </NavLink>
            <a onClick={logout}>Logout</a>
          </div>
        </div>

        <span key="2">
          Welcome <i>{auth.email}</i>
        </span>
      </div>
    )
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
