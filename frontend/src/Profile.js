import React from 'react'
import { NavLink } from 'react-router-dom'

import { api, setToken } from './helper'
import { ProfileSVG } from './svg'
import './Profile.css'
import SettingsSVG from './svg/SettingsSVG'
import LogoutSVG from './svg/LogoutSVG'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion } from '@fortawesome/free-solid-svg-icons'

const Profile = (props) => {
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
      window.location.href = '/admin/users'
    }
  }

  const redirectToTalkyard = async () => {
    const { data } = await api({
      resource: `/api/users/${props.generalContext.auth.user_id}/single-sign-on`,
      method: 'get'
    })
    window.open(data, '_blank')
  }

  const { auth } = props.generalContext

  return auth.loggedIn ? (
    <div className="profile">
      <div className="profileMenuContainer">
        <div key="1" className="wrapper-welcome">
          <div className="welcome-user" key="2">
            Welcome,
            <i title={auth.email}> {auth.email.match(/[^@]+/)}</i>
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
            <div className="profileMenuEntry hidden">
              <span onClick={redirectToTalkyard}>
                <FontAwesomeIcon icon={faQuestion} className="fa-question" />
                Help
              </span>
            </div>
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
  ) : null
}

export default Profile
