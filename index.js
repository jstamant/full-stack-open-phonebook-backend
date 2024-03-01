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

app.get('/api/persons', (request, response) => {
  Contact.find({})
    .then(contacts => {
      response.json(contacts)
    })
})

app.get('/api/persons/:id', (request, response) => {
  Contact.findById(request.params.id)
    .then(contact => response.json(contact))
    .catch(error => response.status(404).end())
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = contacts.find(contact => contact.id === id)
  if (person) {
    contacts = contacts.filter(contact => contact.id !== id)
    response.status(204).end()
  } else {
    response.status(404).end()
  }
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'Missing name and/or number in request' })
  }

  if (contacts.find(contact => contact.name == body.name)) {
    return response.status(400).json({ error: `${body.name} already exists in the phonebook` })
  }

  const id = Math.floor(Math.random() * 1000000)
  const person = { id, name: body.name, number: body.number }
  contacts = contacts.concat(person)
  response.json(person)
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`Phonebook backend is running and listening on port ${port}`)
})
