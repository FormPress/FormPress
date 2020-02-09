import React from 'react'
import { Link } from 'react-router-dom'

import AuthContext from './auth.context'
import { ProfileSVG } from './svg'

const Profile = () => {
  const logout = (e) => {
    e.preventDefault()
    window.localStorage.removeItem('auth')
    window.location.reload()
  }

  const renderLoggedIn = (auth) => {
    return [
      <ProfileSVG className='profileSVG' onClick={ logout } />,
      <span>Welcome { auth.name }</span>
    ]
  }

  return (
    <AuthContext.Consumer>
      {
        (value) => {
         return <div className='profile'>
          {
            (value.loggedIn === true)
              ? renderLoggedIn(value)
              : <div> Welcome <Link to='/login'>login here</Link></div>
          }
          </div>
        }
      }
    </AuthContext.Consumer>
  )
}

export default Profile
