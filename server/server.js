const express = require('express')
const { ObjectID } = require('mongodb')
const bodyParser = require('body-parser')
const R = require('ramda')
const _ = require('lodash');

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/Todo')
const { User } = require('./models/User')

const app = express()
const PORT = process.env.PORT || 3000

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

// DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  Todo
    .findOneAndDelete({ _id: id })
    .then(todo => {
      if (!todo) {
        return res.status(404).send()
      }
      res.send({ todo })
    })
    .catch(err => res.status(400).send())
})

// PATCH /todos/:id
app.patch('/todos/:id', (req, res) => {
  const { id } = req.params
  const body = R.pick(['text', 'completed'], req.body)

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  if (R.is(Boolean, body.completed) && body.completed) {
    body.completedAt = new Date().getTime()
  }
  else {
    body.competed = false
    body.completedAt = null
  }

  Todo
    .findOneAndUpdate(
      { _id: id, },
      { $set: body },
      { new: true }
    )
    .then(todo => {
      if (!todo) {
        return res.status(404).send()
      }
      res.send({ todo })
    })
    .catch(err => res.status(400).send())
})

app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`))

module.exports = { app }