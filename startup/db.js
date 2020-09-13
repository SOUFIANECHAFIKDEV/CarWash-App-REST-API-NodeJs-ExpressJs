const config = require('config');
const winston = require('winston');
const mongoose = require('mongoose');

module.exports = function() {
  mongoose.connect(`mongodb://localhost/${config.get('database')}`)
    .then(() => winston.info('Connected to MongoDB...'));
}