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
      <div key="1" className="wrapper-welcome">
      <div className='welcome-user' key="2">
        Welcome, <i title={auth.email}>{auth.email.match(/^([^@]*)@/)[1]}</i>
      </div>
      <ProfileSVG key="3" className="profileSVG" title="Log out" onClick={logout} />
      </div>
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
