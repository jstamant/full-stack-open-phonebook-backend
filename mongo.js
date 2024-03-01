const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://admin:${password}@cluster0.4wx30wr.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery', false);

mongoose.connect(url);

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Contact = mongoose.model('Contact', contactSchema);

if (process.argv.length === 3) {
  console.log('Phonebook entries:');
  Contact.find({}).then((contacts) => {
    contacts.forEach((contact) => {
      console.log(contact.name, contact.number);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length === 5) {
  const contact = new Contact({
    name: process.argv[3],
    number: process.argv[4],
  });
  contact.save().then((result) => {
    console.log(`Contact "${result.name}", number ${result.number}, added to phonebook`);
    mongoose.connection.close();
  });
} else {
  console.log('Wrong number of arguments.');
  process.exit(1);
}
