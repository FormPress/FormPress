import React from 'react'
import AuthContext from './auth.context'

const Profile = () => {
  return (
    <AuthContext.Consumer>
      {
        (value) => {
         return <div>
          Is logged in: {value.email}
        </div>
        }
      }
    </AuthContext.Consumer>
  )
}

export default Profile
