const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment');
const db = require('../models');

const removeFavs = (rawData) => new Promise((resolve) => {
  db.Article.find({ favorite: true }).lean().then((favs) => {
    const removeIndex = [];
    favs.forEach((element) => {
      removeIndex.push(rawData.map((item) => item.link).indexOf(element.link));
    });
    removeIndex.sort((a, b) => a - b).reverse();
    removeIndex.forEach(element => {
      rawData.splice(element, 1);
    });
    resolve(rawData);
  });
});

const getFavCount = () => new Promise((resolve) => {
  db.Article.find({ favorite: true }).lean().then((favs) => {
    resolve(favs.length);
  });
});

const extractData = (sport) => new Promise((resolve) => {
  const rootUrl = 'https://www.crash.net';
  const urlEndPoint = `/${sport}/news`;

  axios.get(rootUrl + urlEndPoint).then((response) => {
    const $ = cheerio.load(response.data);
    const data = [];

    $('.region-content').find('.views-row').each((i, element) => {
      const scrapedData = {
        title: $(element).find('span').find('a').text(),
        content: $(element).find('.views-field-field-body-teaser').text(),
        date: $(element).find('.views-field-created').text(),
        link: ($(element).find('span').find('a').attr('href')),
        postingDate: moment($(element).find('.views-field-created').text(), 'MM/DD/YYYY - HH:mm').format('X'),
      };

      // if link does not include complete url, preppend root url
      if (!scrapedData.link.includes('http')) scrapedData.link = rootUrl + scrapedData.link;

      data.push(scrapedData);
    });
    resolve({ data });
  });
});

module.exports = (app) => {
  // Load index page
  app.get('/', (req, res) => {
    res.render('index', {
      msg: 'Welcome!',
    });
  });

  app.get('/news/all', (req, res) => {
    const compare = (a, b) => {
      if (a.postingDate < b.postingDate) return 1;
      if (a.postingDate > b.postingDate) return -1;
      return 0;
    };
    Promise.all([extractData('f1'), extractData('motogp'), getFavCount()]).then((result) => {
      const combinedData = [...result[0].data, ...result[1].data];
      combinedData.sort(compare);
      removeFavs(combinedData)
        .then(res.render('articles', { data: combinedData, favCount: result[2] }));
    });
  });

  // Load F1 page
  app.get('/news/f1', (req, res) => {
    extractData('f1').then((data) => {
      res.render('articles', data);
    });
  });

  // Load F1 page
  app.get('/news/f1/favorites', (req, res) => {
    db.Article.find({ favorite: true }).lean().then((data) => {
      res.render('articles', { data });
    });
  });

  // Load motoGp page
  app.get('/news/motogp', (req, res) => {
    extractData('motogp').then((data) => {
      res.render('articles', data);
    });
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
