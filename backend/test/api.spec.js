const path = require('path')
const assert = require('assert').strict
const express = require('express')
const request = require('supertest')
const sinon = require('sinon')
const jwt = require('jsonwebtoken')
const cheerio = require('cheerio')

process.env.JWT_SECRET = 'somesecretforunittesting'
process.env.FILE_UPLOAD_BUCKET = 'someBucketName'

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
    const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 24 *7)
    const jwt_data = {
      user_id: 1,
      email: 'test@formpress.org',
      exp
    }
    const jwt_data2 = {
      user_id: 2,
      email: 'test2@formpress.org',
      exp
    }

    const token = jwt.sign(jwt_data, process.env.JWT_SECRET)
    const token_otheruser = jwt.sign(jwt_data2, process.env.JWT_SECRET)

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

      it(`Endpoint (${endpoint.method}::${endpoint.path}) should return HTTP200 to a request with valid auth token`, (done) => {
        getPoolStub.returns({
          query: async (sql, params) => {
            //console.log('Query is called with ', sql, params)
            return []
          }
        })

        const pro = request(app)
          [endpoint.method](endpoint.exampleRequestPath)
          .set({
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          })

        if (typeof endpoint.exampleRequestBody !== 'undefined') {
          pro.send(endpoint.exampleRequestBody)
        }
        
        pro.expect('Content-Type', /json/)
          .expect(200, done) //method is called with a valid token, should return 200
      })

      it(`Endpoint (${endpoint.method}::${endpoint.path}) should return HTTP403 to a request with valid auth token belonging to another user`, (done) => {
        getPoolStub.returns({
          query: async (sql, params) => {
            //console.log('Query is called with ', sql, params)
            return []
          }
        })

        const pro = request(app)
          [endpoint.method](endpoint.exampleRequestPath)
          .set({
            'Accept': 'application/json',
            'Authorization': `Bearer ${token_otheruser}`
          })

        if (typeof endpoint.exampleRequestBody !== 'undefined') {
          pro.send(endpoint.exampleRequestBody)
        }
        
        pro.expect('Content-Type', /json/)
          .expect(403, done) //method is called with a valid token of another user, should return 403
      })
    }
  })

  describe('Form Rendering', () => {
    it(`Basic form server side renders without problems`, (done) => {
      const form = {
        id: 1,
        title: 'test form',
        props: {
          elements: [  
            {
              id: 1,
              type: 'Text',
              label: 'First Name'
            },
            {
              id: 2,
              type: 'TextArea',
              label: 'Comments'
            },
            {
              id: 3,
              type: 'Button',
              buttonText: 'Submit'
            }
          ]
        }
      }

      getPoolStub.returns({
        query: async (sql, params) => {
          //console.log('Query is called with ', sql, params)
          return [{
            ...form,
            props: JSON.stringify(form.props)
          }]
        }
      })

      const pro = request(app)
        .get('/form/view/1')
        .set({
          'Accept': 'text/html'
        })

      pro.expect('Content-Type', /text\/html/)
        .expect(200)
        .then((res) => {
          const html = res.text

          assert(html.length > 100, 'Rendered form html length is shorter than 100 characters')

          const $ = cheerio.load(html)

          for (const elem of form.props.elements) {
            const rendered = $(`#q_${elem.id}`)

            if (elem.type !== 'Button') {
              assert(rendered.length === 1, `Question ${elem.id} of test form is successfully rendered`)
            } else {
              assert(rendered.length === 0, `Question ${elem.id} of type submit Should not be rendered with id`)
            }
            
          }

          done()
        })
    }).catch(done);
  })
})
