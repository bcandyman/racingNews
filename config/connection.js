const mongoose = require('mongoose');

var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/f1MotoGp'

module.exports = mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
