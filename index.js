const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())
morgan.token('body', function (req) {
    if (req.method === 'POST') {
        return JSON.stringify(req.body) 
    }
    return ' '
})
app.use(morgan(':method :url :status :response-time ms :body'))

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456'
    },
    {
        id: 2,
        name: 'Ada Lovelace',
        number: '39-44-5323523'
    },
    {
        id: 3,
        name: 'Dan Abramov',
        number: '12-43-234345'
    },
    {
        id: 4,
        name: 'Mary Poppendick',
        number: '39-23-6423122'
    }
]

app.get('/api/persons', (req, res) => {
    res.json(persons)
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
        undefined, { sensitivity: 'base'})
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

const PORT = 3001
app.listen(PORT)