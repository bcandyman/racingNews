/* eslint-disable no-underscore-dangle */
const db = require('../models');

module.exports = (app) => {
  // Get all examples
  app.get('/api/examples', (req, res) => {
    res.json('dbExamples');
  });

  // Create a new example
  app.post('/api/examples', (req, res) => {
    res.json('dbExample');
  });


  // Create a new example
  app.post('/api/article/comment/new', (req, res) => {

    console.log(req.body);

    

    db.Comment.create(req.body)
      .then((dbExample) => {
        console.log(req.body.link);
        
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


  // Create a new example
  app.post('/api/article/favorite/save', (req, res) => {
    db.Article.create(req.body)
      .then((dbExample) => res.send(dbExample))
      .catch((err) => res.send(err.message));
  });

  // Delete an example by id
  app.delete('/api/examples/:id', (req, res) => {
    res.json('dbExample');
  });

  app.get('/api/article/comments', (req, res) => {
    db.Article.find({ link: req.query.link })
      .lean()
      .populate('comment')
      .then((dbLibrary) => {
        res.send(dbLibrary[0]);
      }).catch((err) => {
        res.json(err);
      });
  });
};
