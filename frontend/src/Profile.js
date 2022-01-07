import React from 'react'

import AuthContext from './auth.context'
import { ProfileSVG } from './svg'

const Profile = () => {
  const logout = (e) => {
    e.preventDefault()
    window.localStorage.removeItem('auth')
    window.localStorage.removeItem('lastEditedFormId')
    window.location.reload()
  }

  const renderLoggedIn = (auth) => {
    return [
      <ProfileSVG key="1" className="profileSVG" onClick={logout} />,
      <span key="2">
        Welcome <i>{auth.email}</i>
      </span>
    ]
  }

  return (
    <AuthContext.Consumer>
      {(value) => {
        return (
          <div className="profile">
            {value.loggedIn === true ? renderLoggedIn(value) : null}
          </div>
        )
      }}
    </AuthContext.Consumer>
  )
}

export default Profile
