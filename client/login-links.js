let maybeRelogin = function () {
  let tokenExpiration = localStorage.getItem('login-links/tokenExpiration')
  if (tokenExpiration) {
    tokenExpiration = new Date(tokenExpiration)
    let tokenIsCurrent = tokenExpiration > new Date()
    if (tokenIsCurrent) {
      let token = localStorage.getItem('login-links/connectionToken')
      if (LoginLinks.connectionLoginReconnect)
        LoginLinks.connectionLoginReconnect(token)
      else
        LoginLinks.connectionLogin(token)
    } else {
      localStorage.removeItem('login-links/connectionToken')
      localStorage.removeItem('login-links/tokenExpiration')
    }
  }
}

let existingHook

_.extend(LoginLinks, {

  loginWithToken (accessToken, cb) {
    let loginRequest = {'login-links/accessToken': accessToken}

    Accounts.callLoginMethod({
      methodArguments: [loginRequest],
      userCallback: cb
    })
  },

  connectionLogin (token, cb) {
    Accounts._setLoggingIn(true)
    
    Meteor.call('login-links/connectionLogin', token, function (e, data) {
      Accounts._setLoggingIn(false)
      if (!e) {
        Meteor.connection.setUserId(data.userId)

        data.hashedToken = 'unused' // prevent constructor error
        let accessToken = new LoginLinks.AccessToken(data)

        localStorage.setItem('login-links/connectionToken', token)
        localStorage.setItem('login-links/tokenExpiration', new Date(accessToken.expiresAt))
      }

      if (cb)
        cb(e, data)
    })
  },


  // -- private functions --

  _cleanupNewConnection() {
    if (existingHook)
      existingHook()

    // callLoginMethod overwrites Meteor.connection.onReconnect,
    // but let's be defensive
    let wasConnectionLoggedIn = Meteor.userId() &&
          ! localStorage.getItem('Meteor.loginToken')
    
    if (wasConnectionLoggedIn) {
      Meteor.connection.setUserId(null)
    }

    maybeRelogin()
  },

  _setupHook() {
    existingHook = Meteor.connection.onReconnect
    Meteor.connection.onReconnect = LoginLinks._cleanupNewConnection
  }

})

if (! Meteor.userId())
  maybeRelogin()

Meteor.startup(LoginLinks._setupHook)
