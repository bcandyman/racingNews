const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment');
const db = require('../models');


const getCrashData = (sport) => new Promise((resolve) => {
  // define url root and end point
  const rootUrl = 'https://www.crash.net';
  const urlEndPoint = `/${sport}/news`;

  // make axios call to get data
  axios.get(rootUrl + urlEndPoint).then((response) => {
    // set variables
    const $ = cheerio.load(response.data);
    const data = [];

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

      db.Article.find({ link }, (err, docs) => {
        if (err) {
          console.log(err);
        }

        // if doc.length = 0, this item was NOT found in the database and was not favorited.
        if (docs.length === 0) {
          // add article to array of acticles
          data.push({
            content,
            link,
            title,
            postingDate,
          });
        } else {
          console.log("Looks like I've found a favorite!!");
          console.log(docs);
        }
      });
    });
    // resolve promise
    resolve(data);
  });
});

const data = [{
  favoriteItems: [
    {
      item1: 'item1',
    },
    {
      item2: 'item2',
    },
  ],
  unfavoriteItems: [
    {
      item1: 'item1',
    },
    {
      item2: 'item2',
    },
  ],
}];





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
      const newArr = [...result[0], ...result[1]];
      newArr.sort(compare);
      res.render('articles', { data: newArr });
    });
  });

  // Load F1 page
  app.get('/news/f1', (req, res) => {
    getCrashData('f1').then((data) => {
      res.render('articles', { data });
    });
  });

  // Load F1 page
  app.get('/news/f1/favorites', (req, res) => {
    getCrashData('f1').then((data) => {
      res.render('articles', { data });
    });
  });

  // Load motoGp page
  app.get('/news/motogp', (req, res) => {
    getCrashData('motogp').then((data) => {
      res.render('articles', { data });
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
