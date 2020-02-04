const cheerio = require('cheerio');
const axios = require('axios');


const getCrashData = (res, sport) => {
  const rootUrl = 'https://www.crash.net';
  const urlEndPoint = `/${sport}/news`;

  axios.get(rootUrl + urlEndPoint).then((response) => {
    const $ = cheerio.load(response.data);
    const data = [];

    $('.region-content').find('.views-row').each((i, element) => {
      const title = $(element).find('span').find('a').text();
      const content = $(element).find('.views-field-field-body-teaser').text();
      let link = $(element).find('span').find('a').attr('href');

      if (!link.includes('http')) {
        link = rootUrl + link;
      }
      data.push({
        title,
        content,
        link,
      });
    });
    res.render('articles', { data });
  });
};

module.exports = (app) => {
  // Load index page
  app.get('/', (req, res) => {
    res.render('index', {
      msg: 'Welcome!',
    });
  });

  // Load F1 page
  app.get('/news/f1', (req, res) => {
    getCrashData(res, 'f1');
  });

  // Load motoGp page
  app.get('/news/motogp', (req, res) => {
    getCrashData(res, 'motogp');
  });

  // Load example page and pass in an example by id
  app.get('/example/:id', (req, res) => {
    res.render('example', {
    });
  });

  // Render 404 page for any unmatched routes
  app.get('*', (req, res) => {
    res.render('404');
  });
};
