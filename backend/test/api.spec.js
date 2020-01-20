const path = require('path')
const assert = require('assert').strict
const express = require('express')
const request = require('supertest')
const sinon = require('sinon')

const db = require(path.resolve('./', 'db'))
const getPoolStub = sinon.stub(db, 'getPool')

const authenticationMiddleware = require(path.resolve('middleware', 'authentication'))
const apiMiddleware = require(path.resolve('middleware', 'api'))
const endpoints = require(path.resolve('config', 'endpoints'))

const words = ['post', 'get', 'delete', 'put']
const expressMock = {}


for (const word of words) {
  expressMock[`data_${word}`] = [],
  expressMock[word] = (path) => {
    expressMock[`data_${word}`].push(path)
  }
}

apiMiddleware(expressMock)

const app = express()

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')

  next()
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('view engine', 'ejs')

authenticationMiddleware(app)
apiMiddleware(app)


describe('Api', () => {
  describe('Endpoints coverage in middleware', () => {
    for (const endpoint of endpoints.endpoints) {
      it(`Endpoint in config/endpoints.js(${endpoint.method}::${endpoint.path}) actually defined in api middleware only once`, () => {
        const filtered = expressMock[`data_${endpoint.method}`]
          .filter((mocked_endpoint) => mocked_endpoint === endpoint.path)

        assert.equal(filtered.length, 1)
      })
    }
  })

  describe('Endpoints coverage in config/endpoints.js', () => {
    for (const word of words) {
      for (const mocked_endpoint of expressMock[`data_${word}`]) {
        it(`Endpoint in api middleware(${word}::${mocked_endpoint}) is defined in config/endpoints.js only once`, () => {
          const filtered = endpoints
            .endpoints
            .filter(
              (endpoint) => (
                endpoint.path === mocked_endpoint && endpoint.method === word
              )
            )

          assert.equal(filtered.length, 1)
        })
      }
    }
  })

  describe('Protected endpoints in config/endpoints.js', () => {
    const protected_endpoints = endpoints.endpoints.filter(
      (endpoint) => endpoint.protected
    )

    for (const endpoint of protected_endpoints) {
      it(`Endpoint (${endpoint.method}::${endpoint.path}) should return HTTP403 to a request without valid auth token`, (done) => {
        getPoolStub.returns({
          query: async (sql, params) => {
            //console.log('Query is called with ', sql, params)
            return []
          }
        })

        const pro = request(app)
          [endpoint.method](endpoint.exampleRequestPath)
          .set('Accept', 'application/json')

        if (typeof endpoint.exampleRequestBody !== 'undefined') {
          pro.send(endpoint.exampleRequestBody)
        }
        
        pro.expect('Content-Type', /json/)
          .expect(403, done) //method is called with no token, should return 403 
      })      
    }
  })
})
