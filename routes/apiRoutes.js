/* eslint-disable no-underscore-dangle */
const cheerio = require('cheerio');
const axios = require('axios');
const db = require('../models');


const extractWebData = (sport) => new Promise((resolve) => {
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
      };

      // if link does not include complete url, preppend root url
      if (!scrapedData.link.includes('http')) scrapedData.link = rootUrl + scrapedData.link;

      data.push(scrapedData);
    });
    resolve(data);
  });
});

const clearDb = () => new Promise((resolve) => {
  db.Article.remove({}).then(resolve())
});

const saveArticleToDB = (articles) => new Promise((resolve, reject) => {
  db.Article.create(articles)
    .then(resolve())
    .catch(err => reject(err));
})

module.exports = (app) => {

  //scrape webpage and save information to mongodb
  app.get('/api/scrape', (req, res) => {
    clearDb()
      .then(extractWebData('motogp').then(extractedData => {
        saveArticleToDB(extractedData)
          .then(res.sendStatus(200))
      }),
      );
  });
};
