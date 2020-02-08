const mongoose = require('mongoose');

module.exports = mongoose.connect('mongodb://localhost/f1MotoGp', { useNewUrlParser: true });
