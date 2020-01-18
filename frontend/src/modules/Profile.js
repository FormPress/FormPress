import AuthContext from '../auth.context'

export default const Profile = () => {
  return (
    <AuthContext.Consumer>
      {
        (value) => <div>
          Is logged in: {value.loggedIn}
        </div>
      }
    </AuthContext.Consumer>
  )
}
