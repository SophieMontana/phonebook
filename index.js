//REQUIRED DEPENDENCIES 
const { response } = require('express');
const { Router } = require('express');
const express = require('express');
const req = require('express/lib/request');
const date = require('date-and-time');
const { body } = require('express-validator');
const morgan = require('morgan')

const app = express();
//middleware 
app.use(express.json());


// Configure morgan to log body of POST request
morgan.token('person', (req) => {
    if (req.method === 'POST') return JSON.stringify(req.body)
    return null
})

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :person',
  ),
)


//Database   
let phoneBook = [
    { "id": 1, "name": "Arto Hellas", "number": "040-123456"},
    { "id": 2,"name": "Ada Lovelace", "number": "39-44-5323523"},
    { "id": 3,"name": "Dan Abramov", "number": "12-43-234345"},
    { "id": 4,"name": "Mary Poppendieck", "number": "39-23-6423122"}
];

// CRUD///
//Root Directory - Welcome Page 
app.get('/', (req, res) => {
    res.send('Welcome to the Phone Book')
});

//Persons Directory - Phonebook Data 
app.get('/api/persons', (req, res) => {
    res.json(phoneBook);
});

//Info Directory - Time & # of entries @ Runtime
app.get('/info', (req, res) => {
    const now = new Date();
    const value = date.format(now,'dddd, MM/DD/YYYY HH:mm:ss [GMT]Z ');
    console.log("Time data requested : " + value)
    let idLength = phoneBook.length
    res.send('The Phonebook has info for ' + idLength + ' people. \n' + 'Data request time: ' + value);
});

//3.4 DELETE a single phonebook entry by ID 
app.delete('/api/persons/:id', (req, res) => {
        const phone = phoneBook.find(p => p.id === parseInt(req.params.id));
        if(!phone) res.status(204).end('The phonebook entry with the given ID was not found.');
    res.send("Successfully deleted ID: " + phone.id + " , Name: " + phone.name)
})

//3.3 - GET - Look for Phonebook entry with given ID - String converted to integer
app.get('/api/persons/:id', (req, res) => {
    const phone = phoneBook.find(p => p.id === parseInt(req.params.id));
    //if entry not found, print message
    if(!phone) res.status(404).send('The phonebook entry with the given ID was not found.');
    res.status(200).send(phone);
});

//3.5  POST new phonebook entry and generate new ID
const randomId = () => {
    const maxId = phoneBook.length > 0
    ? Math.max(...phoneBook.map(n=>n.id))
    : 0
    return maxId + 1
}
app.post('/api/persons', (req, res) => {
//New Entry Object 
const entry = {
    id: randomId(),
    // phoneBook.length + 1,
    name: req.body.name,
    number: req.body.number };

//3.6 Input Validation (Error Handling/Bad Request)
if (phoneBook.some(phoneBook => phoneBook.name === req.body.name))
return res.status(400).json ({
    error: 'Name already exists.'
})


if (!req.body.name || req.body.name.length < 3 )
    return res.status(400).json ({
        error: 'Name is required; must be at least 3 characters.'
    })

if (!req.body.number || req.body.number.length < 3 )
    return res.status(400).json ({
        error: 'Number is required; must be at least 7 characters.'
    })


//Push Entry Object into array
phoneBook.push(entry);
res.status(204).send(entry);
});



//Unknown Endpoint 
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)



//Port information
const PORT = 3001
app.listen (PORT, () => {
    console.log(`Listening on port ${PORT}`)
});

