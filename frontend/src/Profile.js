import React from 'react'
import AuthContext from './auth.context'

const Profile = () => {
  return (
    <AuthContext.Consumer>
      {
        (value) => {
          console.log('Val is ', value)
         return <div>
          Is logged in: {value.token}
        </div>
        }
      }
    </AuthContext.Consumer>
  )
}

export default Profile
