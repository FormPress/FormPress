const express = require('express')
const path = require('path')

const app = express()
const port = parseInt(process.env.SERVER_PORT || 3000)

const submissionMiddleware = require(path.resolve('middleware', 'submission'))
const loginMiddleware = require(path.resolve('middleware', 'login'))
const authMiddleware = require(path.resolve('middleware', 'auth'))
const apiMiddleware = require(path.resolve('middleware', 'api'))

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

app.get('/', (req, res) => res.send('Hello World!'))

authMiddleware(app)
submissionMiddleware(app)
loginMiddleware(app)
apiMiddleware(app)


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
