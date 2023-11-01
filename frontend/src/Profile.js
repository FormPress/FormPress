import React from 'react'
import { NavLink } from 'react-router-dom'

import { api } from './helper'
import { ProfileSVG } from './svg'
import './Profile.css'
import SettingsSVG from './svg/SettingsSVG'
import LogoutSVG from './svg/LogoutSVG'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGears, faQuestion } from '@fortawesome/free-solid-svg-icons'

const Profile = (props) => {
  const logout = async (e) => {
    e.preventDefault()

    await api({
      resource: `/api/users/logout`,
      method: 'post'
    })

    window.location.reload()
  }

  const logoutAsUser = async (e) => {
    e.preventDefault()

    window.localStorage.removeItem('auth')
    window.localStorage.removeItem('lastEditedFormId')
    const { success } = await api({
      resource: `/api/admin/users/logout-as-user/`,
      method: 'post'
    })

    if (success === true) {
      await props.generalContext.user.whoAmI()
      window.location.href = '/admin/users'
    }
  }

  const redirectToTalkyard = async () => {
    const { data } = await api({
      resource: `/api/users/${props.generalContext.auth.user_id}/talkyard-sso`,
      method: 'get'
    })
    window.open(data, '_blank')
  }

  const { auth } = props.generalContext
  const { compact } = props

  if (compact) {
    return [
      <li key="5">
        <NavLink
          to="/settings"
          activeClassName="selected"
          onClick={props.toggleHMenu}>
          Settings
        </NavLink>
      </li>,
      auth.impersonate ? (
        <li key="6">
          <span onClick={logoutAsUser}>Logout as User</span>
        </li>
      ) : (
        ''
      ),
      <li key="7">
        <span onClick={redirectToTalkyard}>Help</span>
      </li>,
      <li key="8">
        <span onClick={logout}>Logout</span>
      </li>
    ]
  }

  return auth.loggedIn ? (
    <div className="profile">
      <div className="profileMenuContainer">
        <div key="1" className="wrapper-welcome">
          <div className="welcome-user" key="2">
            Welcome,
            <i title={auth.email}> {auth.email.match(/[^@]+/)}</i>
          </div>
          <ProfileSVG key="1" className="profileSVG" />
          <div className="profileMenuContent">
            <div className="profileMenuEntry">
              <NavLink to="/settings" activeClassName="selected">
                <SettingsSVG width={16} heigth={16} /> Settings
              </NavLink>
            </div>
            {auth.impersonate ? (
              <div className="profileMenuEntry">
                <span onClick={logoutAsUser}>
                  <LogoutSVG width={16} heigth={16} /> Logout as User
                </span>
              </div>
            ) : (
              ''
            )}
            <div className="profileMenuEntry">
              <span onClick={redirectToTalkyard}>
                <FontAwesomeIcon icon={faQuestion} className="fa-question" />{' '}
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
