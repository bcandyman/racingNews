/* eslint-disable no-underscore-dangle */
const db = require('../models');

module.exports = (app) => {
  // Create a new comment
  app.post('/api/article/comment/new', (req, res) => {
    // console.log(req.body);

    db.Comment.create(req.body)
      .then((dbExample) => {
        console.log('.then');
        console.log(dbExample);
        console.log(req.body.link);
        
        db.Article.findOneAndUpdate(
          { link: req.body.link },
          { $push: { comment: dbExample._id } },
          { favorite: false },
        );
      })
      .then((dbArticle) => {
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

  // app.delete('/api/article/comment/delete', (req, res) => {
  //   db.Comment.findOneAndRemove({ comment: req.body }, (err, result) => {
  //     if (err) {
  //       console.log(err);
  //     }

  //     const commentId = result._id;


  //     db.Article.updateOne({ _id: articleId }, { $pullAll: { comment: [commentId] } })


  //     // db.Comment.findByIdAndDelete(req.body).exec((err, removed) => {
  //     //   if (err) {
  //     //     console.log(err);
  //     //   }
  //     //   res.send(removed);
  //     // });
  //   });
  // });
};
