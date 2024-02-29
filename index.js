const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(morgan('tiny'))

const port = 3001

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
  response.json(contacts)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = contacts.find((contact) => contact.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
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

app.listen(port, () => {
  console.log(`Phonebook backend is running and listening on port ${port}`)
})
