const db = require('../models');

module.exports = (app) => {
  // Load index page
  app.get('/', (req, res) => {
    db.Article.find({}).lean().then((incomingDbData) => {
      res.render('index', { data: incomingDbData });
    });
  });


  // Render 404 page for any unmatched routes
  app.get('*', (req, res) => {
    res.render('404');
  });
};
