const express = require('express')
const bodyParser = require('body-parser')

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/Todo')
const { User } = require('./models/User')

const app = express()

// Middleware
app.use(bodyParser.json())

// POST
app.post('/todos', (req, res) => {
  console.log(req.body)
  const todo = new Todo({
    text: req.body.text
  })

  todo.save().then(doc => {
    res.send(doc)
  })
  .catch(err => {
    console.log('Unable to save todo: ', err)
    res.status(400).send(err)
  })
})

// GET
app.get('/todos', (req, res) => {

})

app.listen(3000, () => console.log('Listening on PORT 3000...'))