const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment');
const db = require('../models');

const parseFavs = (rawData) => new Promise((resolve) => {
  const parsedData = {};
  const favLinks = [];
  db.Article.find().lean().then((favs) => {
    for (let i = 0; i < favs.length; i += 1) {
      favLinks.push(favs[i].link);
    }
    const data = rawData.filter((el) => {
      if (!favLinks.includes(el.link)) {
        return el;
      }
    });
    parsedData.data = data;
    parsedData.favCount = favLinks.length;
    resolve(parsedData);
  });
});

const getCrashData = (sport) => new Promise((resolve) => {
  // define url root and end point
  const rootUrl = 'https://www.crash.net';
  const urlEndPoint = `/${sport}/news`;

  // make axios call to get data
  axios.get(rootUrl + urlEndPoint).then((response) => {
    // set variables
    const $ = cheerio.load(response.data);
    const rawData = [];

    // define data
    $('.region-content').find('.views-row').each((i, element) => {
      const title = $(element).find('span').find('a').text();
      const content = $(element).find('.views-field-field-body-teaser').text();
      const date = $(element).find('.views-field-created').text();
      let link = $(element).find('span').find('a').attr('href');
      const postingDate = moment(date, 'MM/DD/YYYY - HH:mm').format('X');

      // if like does not include complete url, preppend root url
      if (!link.includes('http')) {
        link = rootUrl + link;
      }

      // push scraped information to data array
      rawData.push({
        content,
        link,
        title,
        postingDate,
      });
    });

    parseFavs(rawData).then((data) => {
      resolve(data);
    });
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
      if (a.postingDate < b.postingDate) {
        return 1;
      }
      if (a.postingDate > b.postingDate) {
        return -1;
      }
      return 0;
    };

    Promise.all([getCrashData('f1'), getCrashData('motogp')]).then((result) => {

      const combinedData = [];
      result[0].data.forEach((element) => {
        combinedData.push(element);
      });
      result[1].data.forEach((element) => {
        combinedData.push(element);
      });

      combinedData.sort(compare);

      res.render('articles', { data: combinedData, favCount: result[0].favCount });
    });
  });

  // Load F1 page
  app.get('/news/f1', (req, res) => {
    getCrashData('f1').then((data) => {
      res.render('articles', data);
    });
  });

  // Load F1 page
  app.get('/news/f1/favorites', (req, res) => {
    db.Article.find().lean().then((data) => {
      res.render('articles', { data });
    });
  });

  // Load motoGp page
  app.get('/news/motogp', (req, res) => {
    getCrashData('motogp').then((data) => {
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
