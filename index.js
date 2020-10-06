/* eslint-disable consistent-return */
// IMPORTS AND DEFS
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const Person = require('./models/person');

// MIDDLEWARE

// For cross-origin javascript
app.use(cors());
// For showing static content (our front-end in this case)
app.use(express.static('build'));
// For building JS objects from strings
app.use(express.json());
// For logs
morgan.token('body', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body);
  }
  return ' ';
});
app.use(morgan(':method :url :status :response-time ms :body'));

// ROUTES

app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get('/info', (req, res) => {
  Person.countDocuments({})
    .then((result) => {
      res.send(`<p>Phonebook has info for ${result} people.</p>
            <p>${new Date()}</p>`);
    });
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

// THIS CODE DEPRECATED AFTER MONGODB
// Compares the name sent in the request with
// the names already on the list and returns
// true if it finds at least one.

// const nameComparison = (name) => {
//     const filteredPersons = persons.filter(person => {
//         const comparison = person.name.localeCompare(name,
//             undefined, { sensitivity: 'base' })
//         return comparison === 0
//     })

//     return filteredPersons.length > 0
// }

app.post('/api/persons', (req, res, next) => {
  const { body } = req;

  if (!body.number || !body.name) {
    return res.status(400).json({
      error: 'name or number missing',
    });
  }

  // THIS CODE DEPRECATED AFTER MONGODB
  // else if (nameComparison(body.name)) {
  //     return res.status(400).json({
  //         error: 'name must be unique'
  //     })
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save()
    .then((savedPerson) => {
      res.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const { body } = req;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

// ERROR HANDLING

// This actually has to come after the routes are defined
// or it will handle ALL routes with a 404
// Custom middleware for returning 404
const unknowEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknow endpoint' });
};
app.use(unknowEndpoint);

// Custom middleware for handling errors
const errorHandler = (error, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message });
  }

  next(error);
};
app.use(errorHandler);

// SERVER CONFIG

const { PORT } = process.env;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on ${PORT}`);
});
