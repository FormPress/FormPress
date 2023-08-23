const path = require('path')
const oauth2orize = require('oauth2orize')

const jwt = require('jsonwebtoken')
const { token } = require(path.resolve('helper')).token
const { v4 } = require('uuid')

const { ensureLoggedIn } = require(path.resolve('middleware', 'authorization'))
const { model } = require(path.resolve('helper'))
const userModel = model.user
const oauthModel = model.oauth

const session = require('cookie-session')
const server = oauth2orize.createServer()

// Oauth client authentication middleware
const authenticateClient = async (req, res, next) => {
  const clientId = req.body.client_id
  const clientSecret = req.body.client_secret

  if (!clientId || !clientSecret) {
    return res.status(401).json({ error: 'Invalid client credentials' })
  }

  const client = await clients.getClientById(clientId)

  if (client === false) {
    return res.status(401).json({ error: 'Invalid client credentials' })
  }

  if (client.secret !== clientSecret) {
    return res.status(401).json({ error: 'Invalid client credentials' })
  }

  next()
}

const clients = JSON.parse(process.env.OAUTH_CLIENTS || '[]')

clients.getClientById = async (id) => {
  return clients.find((client) => client.id === id) || false
}

server.serializeClient((client, done) => done(null, client.id))

server.deserializeClient((id, done) => {
  clients
    .getClientById(id)
    .then((client) => done(null, client))
    .catch((err) => done(err))
})

// AUTHORIZATION CODE GRANT
server.grant(
  oauth2orize.grant.code((client, redirectUri, user, ares, done) => {
    const tokenTemplate = {
      id: v4(),
      user_id: user.user_id,
      user_email: user.email,
      client_id: client.id,
      redirectUri: redirectUri
    }

    // an exp of 5 minutes
    const exp = Math.floor(Date.now() / 1000) + 60 * 5

    const authorization_code = token(tokenTemplate, exp)

    const dbResponse = oauthModel.storeAuthorizationCode({
      code_id: tokenTemplate.id,
      authorization_code,
      client,
      user,
      redirectUri
    })

    if (dbResponse !== false) {
      return done(null, authorization_code)
    }
  })
)

// EXCHANGE AUTHORIZATION CODE FOR ACCESS TOKEN
server.exchange(
  oauth2orize.exchange.code(async (client, code, redirectUri, done) => {
    let user_id, code_id

    // First layer of verification
    jwt.verify(code, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return done(err)
      }

      if (decoded.exp < Date.now() / 1000) {
        return done(new Error('Code is expired.'))
      }

      code_id = decoded.id
      user_id = decoded.user_id
    })

    const user = await userModel.get({ user_id })

    if (!user) {
      return done(new Error('User not found'))
    }

    const access_token = token(user)

    const dbResponse = oauthModel.storeAccessToken({
      code_id,
      access_token
    })

    // Second layer of verification, if the code is already used
    if (dbResponse === false) {
      return done(
        new Error('Error exchanging code for access token. Used already?')
      )
    }

    return done(null, access_token, null, { ...user })
  })
)

// EXPRESS ROUTES
module.exports = (app) => {
  app.use(
    session({
      secret: process.env.JWT_SECRET,
      // Cookie Options:
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    })
  )

  app.get(
    '/oauth2/authorize/dialog',
    ensureLoggedIn,
    server.authorization(async (clientID, redirectURI, scope, done) => {
      const client = await clients.getClientById(clientID)

      if (client === false) {
        return done(new Error('Client not found'))
      }

      if (client.redirectUri !== redirectURI) {
        return done(new Error('redirect URI does not match'))
      }

      // if all is well, return the client by adding the scope
      client.scope = scope
      return done(null, client, redirectURI)
    }),
    (req, res) => {
      return res.render('oauth2-consent', {
        transactionID: req.oauth2.transactionID,
        user: req.user,
        oauthClient: req.oauth2.client
      })
    }
  )

  app.post('/oauth2/authorize/decision', server.decision())

  app.post(
    '/oauth2/token',
    authenticateClient,
    server.token(),
    server.errorHandler()
  )
}
