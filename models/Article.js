const mongoose = require('mongoose');

const { Schema } = mongoose;
const ArticleSchema = new Schema({
  header: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
});

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;
