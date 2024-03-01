require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const { env } = require('process')

const Contact = require('./models/contact')

const app = express()
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token('post-body', (request, response) => {
  if (request.method == 'POST') {
    return JSON.stringify(request.body)
  }
  // Must return a space, or the token will print a '-'
  return ' '
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))

app.get('/info', (request, response, next) => {
  Contact.countDocuments({})
    .then(count => {
      response.send(`<p>The phonebook has contact information for ${count} people.</p><p>${new Date}</p>`)
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Contact.find({})
    .then(contacts => response.json(contacts))
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Contact.findById(request.params.id)
    .then(contact => {
      if (contact) {
        response.json(contact)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Contact.findByIdAndDelete(id)
    .then(deleted => {
      if (deleted) {
        response.status(204).json(deleted)
      } else {
        let error = new Error(`Resource "${id}" not found in database`)
        error.name = 'NotFound'
        next(error)
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const contact = new Contact({ name: body.name, number: body.number })
  contact.save()
    .then(contact => response.json(contact))
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  Contact.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true })
    .then(updated => {
      if (updated) {
        response.json(updated)
      } else {
        let error = new Error(`Resource "${name}" not found in database`)
        error.name = 'NotFound'
        next(error)
      }
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(`${error.name}: ${error.message}`)
  //TODO rm return
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformed ID' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'NotFound') {
    return response.status(404).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)


const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`Phonebook backend is running and listening on port ${port}`)
})
