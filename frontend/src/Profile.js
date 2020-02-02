import React from 'react'
import { Link } from 'react-router-dom'
import AuthContext from './auth.context'

const Profile = () => {

  const logout = (e) => {
    e.preventDefault()
    window.localStorage.removeItem('auth')
    window.location.reload()
  }

  return (
    <AuthContext.Consumer>
      {
        (value) => {
         return <div>
          {
            (value.loggedIn === true)
              ? <div> Wellcome {value.email}. <a href='#/' onClick={logout}>logout</a></div>
              : <div> Wellcome <Link to='/login'>login here</Link></div>
          }

        </div>
        }
      }
    </AuthContext.Consumer>
  )
}

export default Profile