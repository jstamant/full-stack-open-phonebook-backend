const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

console.log('Connecting to', url);
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message);
  });

const numberValidator = [
  /^\d{2,3}-\d+$/,
  'Phone number is invalid: must be two parts, all numbers (ex 123-4567)',
];

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    validate: numberValidator,
  },
});

contactSchema.set('toJSON', {
  transform: (_document, object) => {
    const returnedObject = { ...object };
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    return returnedObject;
  },
});

module.exports = mongoose.model('Contact', contactSchema);
