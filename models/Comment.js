const mongoose = require('mongoose');

const { Schema } = mongoose;
const CommentSchema = new Schema({
  title: String,
  body: String,
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
