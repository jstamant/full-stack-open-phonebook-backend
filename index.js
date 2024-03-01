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

let contacts = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

app.get('/info', (request, response) => {
  response.send(`<p>The phonebook has contact information for ${contacts.length} people.</p><p>${new Date}</p>`)
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
    .then(contact => {
      if (contact) {
        response.status(204).json(contact)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'Missing name and/or number in request' })
  }

  // if (contacts.find(contact => contact.name == body.name)) {
  //   return response.status(400).json({ error: `${body.name} already exists in the phonebook` })
  // }

  const contact = new Contact({ name: body.name, number: body.number })
  contact.save().then(contact => response.json(contact))
})


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformed ID'})
  }

  next(error)
}

app.use(errorHandler)


const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`Phonebook backend is running and listening on port ${port}`)
})
