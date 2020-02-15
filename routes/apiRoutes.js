/* eslint-disable no-underscore-dangle */
const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment');
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
        postingDate: moment($(element).find('.views-field-created').text(), 'MM/DD/YYYY - HH:mm').format('X'),
      };

      // if link does not include complete url, preppend root url
      if (!scrapedData.link.includes('http')) scrapedData.link = rootUrl + scrapedData.link;

      data.push(scrapedData);
    });
    resolve(data);
  });
});

const clearDb = () => new Promise((resolve) => {
  db.Article.remove({}).then(resolve());
});

const saveArticleToDB = (articles) => new Promise((resolve, reject) => {
  db.Article.create(articles)
    .then(resolve())
    .catch((err) => reject(err));
});

module.exports = (app) => {
  // scrape webpage and save information to mongodb
  app.get('/api/scrape', (req, res) => {
    const compare = (a, b) => {
      if (a.postingDate < b.postingDate) return 1;
      if (a.postingDate > b.postingDate) return -1;
      return 0;
    };

    Promise.all([extractWebData('f1'), extractWebData('motogp'), clearDb()])
      .then((extractedData) => {
        // combine data from each webpage scraped
        const combinedData = [...extractedData[0], ...extractedData[1]];
        // sort by posting date
        combinedData.sort(compare);
        // save to mongo
        saveArticleToDB(combinedData)
          .then(() => {
            res.sendStatus(200);
          });
      });
  });


  app.post('/api/comment/new', (req, res) => {
    // save comment to database
    db.Comment.create({ title: req.body.title, body: req.body.body })
      .then((savedComment) => db.Article.findOneAndUpdate({ _id: req.body.articleId },
        { $push: { comment: savedComment._id } },
        { new: true })
        .then(res.send(savedComment)));
  });


  app.delete('/api/comment/delete', (req, res) => {
    db.Comment.findByIdAndDelete({ _id: req.body.commentId })
      .then((deletedComment) => {
        db.Article.update({ _id: req.body.articleId, $pull: { comment: req.body.commentId } })
          .then(res.send(deletedComment));
      });
  });


  app.get('/api/article/comments', (req, res) => {
    db.Article.find({ _id: req.query.articleId }).populate('comment')
      .then((article) => {
        res.send(article[0].comment);
      });
  });
};
