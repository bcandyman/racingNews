
module.exports = (app) => {
  // Get all examples
  app.get('/api/examples', (req, res) => {
    res.json('dbExamples');
  });

  // Create a new example
  app.post('/api/examples', (req, res) => {
    res.json('dbExample');
  });

  // Delete an example by id
  app.delete('/api/examples/:id', (req, res) => {
    res.json('dbExample');
  });
};
