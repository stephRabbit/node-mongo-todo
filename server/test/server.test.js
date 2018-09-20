const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const {app} = require('../server')
const {Todo} = require('../models/Todo')

const todos = [
  {
    '_id': new ObjectID(),
    'text': 'Todo 1'
  },
  {
    '_id': new ObjectID(),
    'text': 'Todo 2',
    'completed': true,
    'completedAt': 2150
  }
]

beforeEach(done => {
  // Remove all todos before insert
  Todo.deleteMany({}).then(() => {
    return Todo.insertMany(todos)
  })
  .then(() => done())
})

describe('POST /todos', () => {
  it('should create a new todo', done => {
    const text = 'Test todo text'

    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.find({ text }).then(todos => {
          expect(todos.length).toBe(1)
          expect(todos[0].text).toBe(text)
          done()
        })
        .catch(e => done(e))
      })
  })

  it('should not create todo with invalid body data', done => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.find({}).then(todos => {
          expect(todos.length).toBe(2)
          done()
        })
        .catch(e => done(e))
      })
  })
})

describe('GET /todos', () => {
  it('should get all todos', done => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2)
      })
      .end(done)
  })
})

describe('GET /todos/:id', () => {
  it('should return todo doc', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done)
  })

  it('should return 404 when ID is valid but does not exist', done => {
    const id = new ObjectID().toHexString()

    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 because of invalid ID', done => {
    request(app)
      .get('/todos/fakeID123')
      .expect(404)
      .end(done)
  })
})

describe('DELETE /todos/:id', () => {
  it('should return the deleted todo', done => {
    const hexId = todos[1]._id.toHexString()

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect(res => expect(res.body.todo._id).toBe(hexId))
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo
          .findById(hexId)
          .then(todo => {
            expect(todo).toNotExist()
            done()
          })
          .catch(e => done(e))
        })
  })

  it('should return 404 when ID is valid but does not exist', done => {
    const id = new ObjectID().toHexString()

    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 because of invalid ID', done => {
    request(app)
      .get('/todos/fakeID123')
      .expect(404)
      .end(done)
  })
})

describe('PATCH /todos/:id', () => {
  it('should update todo text and set completed to TRUE', done => {
    const hexId = todos[1]._id.toHexString()
    const updatedTodo = {
      text: 'Todo 1 Update',
      completed: true,
    }

    request(app)
      .patch(`/todos/${hexId}`)
      .send(updatedTodo)
      .expect(200)
      .expect(res => {
        const { text, completed, completedAt } = res.body.todo
        expect(text).toBe(updatedTodo.text)
        expect(completed).toBe(true)
        expect(completedAt).toBeA('number')
      })
      .end(done)
  })

  it('should clear completedAt when todo is not completed', done => {
    const hexId = todos[0]._id.toHexString()
    const updatedTodo = {
      text: 'Todo 2 Update',
      completed: false,
    }

    request(app)
      .patch(`/todos/${hexId}`)
      .send(updatedTodo)
      .expect(200)
      .expect(res => {
        const { text, completed, completedAt } = res.body.todo
        expect(completed).toBe(false)
        expect(text).toBe(updatedTodo.text)
        expect(completedAt).toNotExist()
      })
      .end(done)
  })
})
