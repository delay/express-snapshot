const express = require('express')
const app = express()
const router = express.Router()

router.get('/foo/foo1.html', (req, res, next) => {
  res.send('<div>foo1</div>')
})

router.get('/foo/foo2.html', (req, res, next) => {
  res.send('<div>foo2</div>')
})

app.use('/', router)

app.get('/bar.html', (req, res, next) => {
  res.send('<div>bar</div>')
})

app.get('/baz.html', (req, res, next) => {
  res.send('<div>baz</div>')
})

module.exports = app
