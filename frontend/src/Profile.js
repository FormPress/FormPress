import React from 'react'
import { NavLink } from 'react-router-dom'

import { api, setToken } from './helper'
import AuthContext from './auth.context'
import { ProfileSVG } from './svg'
import './Profile.css'
import SettingsSVG from './svg/SettingsSVG'
import LogoutSVG from './svg/LogoutSVG'

const Profile = () => {
  const logout = (e) => {
    e.preventDefault()
    window.localStorage.removeItem('auth')
    window.localStorage.removeItem('lastEditedFormId')
    window.location.reload()
  }

  const logoutAsUser = async (e) => {
    e.preventDefault()
    window.localStorage.removeItem('auth')
    window.localStorage.removeItem('lastEditedFormId')
    const { success, data } = await api({
      resource: `/api/admin/users/logout-as-user/`,
      method: 'post'
    })

    if (success === true) {
      setToken(data.token)
      window.localStorage.setItem(
        'auth',
        JSON.stringify({
          email: data.email,
          name: data.name,
          exp: data.exp,
          token: data.token,
          user_id: data.user_id,
          user_role: data.user_role,
          permission: data.permission,
          admin: data.admin,
          loggedIn: true
        })
      )
    }
    window.location.reload()
  }

  const renderLoggedIn = (auth) => {
    return (
      <div className="profile">
        <div className="profileMenuContainer">
          <div key="1" className="wrapper-welcome">
            <div className="welcome-user" key="2">
              Welcome, <i title={auth.email}>{auth.email}</i>
            </div>
            <ProfileSVG key="1" className="profileSVG" />
            <div className="profileMenuContent dn">
              <div className="profileMenuEntry">
                <NavLink to="/settings" activeClassName="selected">
                  <SettingsSVG />
                  Settings
                </NavLink>
              </div>
              {auth.impersonate ? (
                <div className="profileMenuEntry">
                  <span onClick={logoutAsUser}>
                    <LogoutSVG width={16} heigth={16} />
                    Logout as User
                  </span>
                </div>
              ) : (
                ''
              )}
              <div className="profileMenuEntry">
                <span onClick={logout}>
                  <LogoutSVG width={16} heigth={16} />
                  Logout
                </span>
              </div>
            </div>
          </div>
        </div>
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
