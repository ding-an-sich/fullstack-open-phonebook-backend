const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://vmrc:${password}@cluster0.dtjy2.gcp.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

switch(process.argv.length){
    case 3:
        Person.find({}).then(result =>{
            console.log('phonebook:')
            result.forEach(person => {
                console.log(`${person.name} ${person.number}`)
            })
            mongoose.connection.close()
        })
        break
    case 5:
        const person = new Person({
            name: process.argv[3],
            number: process.argv[4]
        })
        person.save().then(result => {
            console.log(`added ${result.name} number ${result.number} to phonebook`)
            mongoose.connection.close()
        })
        break
    default:
        console.log(`Please provide the correct number of arguments:
                    for listing the phonebook: node mongo.js <password>
                    for adding to phonebook: node mongo.js <password> <name> <number>`
                    )
        process.exit(1)
}
