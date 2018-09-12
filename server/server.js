const express = require('express')
const { ObjectID } = require('mongodb')
const bodyParser = require('body-parser')

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/Todo')
const { User } = require('./models/User')

const app = express()

// Middleware
app.use(bodyParser.json())

// POST
app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  })

  todo
    .save()
    .then(doc => res.send(doc))
    .catch(err => {
      // Unable to save todo!
      res.status(400).send(err)
    })
})

// GET /todos
app.get('/todos', (req, res) => {
  Todo
    .find()
    .then(todos => {
      res.send({ todos })
    })
    .catch(err => res.status(400).send(err))
})

// GET /todos/:id
app.get('/todos/:id', (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  Todo
    .findById(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send()
      }
      res.send({ todo })
    })
    .catch(err => res.status(400).send())

})

app.listen(3000, () => console.log('Listening on PORT 3000...'))

module.exports = { app }