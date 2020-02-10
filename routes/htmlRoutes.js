const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment');
const db = require('../models');

const hasComments = (rawData) => new Promise((resolve) => {
  db.Article.find({ 'comment.0': { '$exists': true } }).lean().then((data) => {
    const commented = data.map((el) => el.link);
    rawData.forEach((element, index) => {
      if (commented.includes(element.link)) {
        rawData[index].commented = true;
      }
    });
    resolve();
  });
});

const removeFavs = (rawData) => new Promise((resolve) => {
  db.Article.find({ favorite: true }).lean().then((favs) => {
    const removeIndex = [];
    favs.forEach((element) => {
      removeIndex.push(rawData.map((item) => item.link).indexOf(element.link));
    });
    removeIndex.sort((a, b) => a - b).reverse();
    removeIndex.forEach((element) => {
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

  // Load all news articles
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
        .then((results2) => {
          hasComments(results2)
            .then(res.render('articles', { data: results2, favCount: result[2], pageHeader: 'All' }));
        });
    });
  });

  // Load F1 page
  app.get('/news/f1', (req, res) => {
    Promise.all([extractData('f1'), getFavCount()]).then((results) => {
      const data = [...results[0].data];
      removeFavs(data)
        .then((results2) => {
          hasComments(results2)
            .then(
              res.render('articles', { data: results2, favCount: results[1], pageHeader: 'F1' }),
            );
        });
    });
  });

  // Load MotoGp page
  app.get('/news/motogp', (req, res) => {
    Promise.all([extractData('motogp'), getFavCount()]).then((results) => {
      const data = [...results[0].data];
      removeFavs(data)
        .then((results2) => {
          hasComments(results2)
            .then(res.render('articles', { data: results2, favCount: results[1], pageHeader: 'MotoGP' }));
        });
    });
  });

  // Load favorites page
  app.get('/news/all/favorites', (req, res) => {
    db.Article.find({ favorite: true }).lean()
      .then((results2) => {
        hasComments(results2)
          .then(res.render('articles', { data: results2, pageHeader: 'Favorite' }));
      });
  });

  // Render 404 page for any unmatched routes
  app.get('*', (req, res) => {
    res.render('404');
  });
};
