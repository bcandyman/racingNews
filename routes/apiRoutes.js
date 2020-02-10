/* eslint-disable no-underscore-dangle */
const db = require('../models');

module.exports = (app) => {
  // Create a new comment
  app.post('/api/article/comment/new', (req, res) => {
    db.Comment.create(req.body)
      .then((dbExample) => {
        return db.Article.findOneAndUpdate(
          { link: req.body.link },
          { $push: { comment: dbExample._id } },
          { new: true },
        );
      }).then((dbArticle) => {
        res.json(dbArticle);
      })
      .catch((err) => res.send(err.message));
  });

  // Create a new favorite article
  app.post('/api/article/favorite/save', (req, res) => {
    db.Article.create(req.body)
      .then((dbExample) => res.send(dbExample))
      .catch((err) => res.send(err.message));
  });

  // Get article comments
  app.get('/api/article/comments', (req, res) => {
    db.Article.find(req.query)
      .lean()
      .populate('comment')
      .then((dbLibrary) => {
        res.send(dbLibrary[0]);
      })
      .catch((err) => {
        res.json(err);
      });
  });
};
