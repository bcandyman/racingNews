const mongoose = require('mongoose');

const { Schema } = mongoose;
const ArticleSchema = new Schema({
  title: {
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
    unique: true,
  },
  comment: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  // favorite: {
  //   type: Boolean,
  //   default: false,
  // },
});

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;
