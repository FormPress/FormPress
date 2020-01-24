const express = require('express')
const path = require('path')
const fs = require('fs')
const basicAuth = require('express-basic-auth')

const app = express()
const port = parseInt(process.env.SERVER_PORT || 3000)

const submissionMiddleware = require(path.resolve('middleware', 'submission'))
const loginMiddleware = require(path.resolve('middleware', 'login'))
const authenticationMiddleware = require(path.resolve('middleware', 'authentication'))
const apiMiddleware = require(path.resolve('middleware', 'api'))

app.use(basicAuth({
  users: { 'admin': '243243' },
  challenge: true,
  realm: 'FormPress Beta'
}))

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
submissionMiddleware(app)
loginMiddleware(app)
apiMiddleware(app)

if (process.env.FP_ENV === 'production') {
  app.use(express.static('/frontend/build'))  
}

const staticIndexHtml = fs.readFileSync('/frontend/build/index.html', { encoding: 'utf8' })

// Send built index.html to allow refreshes to work
app.get('*', (req, res) => {
  res.header('Content-type', 'text/html')
  res.status(200).send(staticIndexHtml)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
