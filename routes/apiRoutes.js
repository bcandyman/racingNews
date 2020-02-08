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
  app.post('/api/article/favorite/save', (req, res) => {
    console.log(req.body);
    db.Article.create(req.body)
      .then((dbExample) => console.log(dbExample))
      .catch((err) => console.log(err.message));
  });

  // Delete an example by id
  app.delete('/api/examples/:id', (req, res) => {
    res.json('dbExample');
  });
};
