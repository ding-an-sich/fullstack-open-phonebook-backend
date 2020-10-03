// IMPORTS AND DEFS
require('dotenv').config()
const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
// Custom middleware for returning 404
const unknowEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknow endpoint' })
}
const app = express()
const Person = require('./models/person')

// MIDDLEWARE

// For cross-origin javascript
app.use(cors())
// For showing static content (our front-end in this case)
app.use(express.static('build'))
// For building JS objects from strings
app.use(express.json())
// For logs
morgan.token('body', function (req) {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
    return ' '
})
app.use(morgan(':method :url :status :response-time ms :body'))

// ROUTES

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people.</p>
             <p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)
    person ? res.json(person) : res.status(404).end()
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(p => p.id !== id)

    res.status(204).end()
})

// Compares the name sent in the request with 
// the names already on the list and returns
// true if it finds at least one.
const nameComparison = (name) => {
    const filteredPersons = persons.filter(person => {
        const comparison = person.name.localeCompare(name,
            undefined, { sensitivity: 'base' })
        return comparison === 0
    })

    return filteredPersons.length > 0
}

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.number || !body.name) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    } else if (nameComparison(body.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random() * 10000)
    }

    persons = persons.concat(person)

    res.json(person)
})

// This actually has to come after the routes are defined
// or it will handle ALL routes with a 404
app.use(unknowEndpoint)

// SERVER CONFIG

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})