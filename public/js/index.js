const articlePlaceholder = { article: {} };

const saveArticleToDb = (title, content, link, favorite) => new Promise((resolve) => {
  $.ajax({
    url: '/api/article/favorite/save',
    type: 'POST',
    data: {
      title,
      content,
      link,
      favorite,
    },
  }).then((results) => {
    resolve(results);
  });
});


$('.save-article').click(function() {
  const parentElmnt = $(this).parent().find('a');
  const title = parentElmnt.find('H3').text();
  const content = parentElmnt.find('H6').text();
  const link = $(this).attr('data-link');
  const favorite = true;

  saveArticleToDb(title, content, link, favorite)
    .then(window.location.reload());
});

$('.view-comments').click(function() {
  const parentElmnt = $(this).parent().find('a');
  articlePlaceholder.article.title = parentElmnt.find('H3').text();
  articlePlaceholder.article.content = parentElmnt.find('H6').text();
  articlePlaceholder.article.link = $(this).attr('data-link');
  articlePlaceholder.article.favorite = false;

  $.ajax({
    url: '/api/article/comments',
    type: 'GET',
    data: { link: articlePlaceholder.article.link },
  }).then((res) => {
    $('.existing-comments').empty();

    res.comment.forEach((element) => {
      const parentDiv = $('<div>');
      const title = $('<h3>').text(element.title);
      const body = $('<p>').text(element.body);
      const hr = $('<hr>');

      parentDiv.append(title);
      parentDiv.append(body);
      parentDiv.append(hr);

      $('.existing-comments').append(parentDiv);
    });
  });
});

$('#submit-comment').click(() => {
  saveArticleToDb(articlePlaceholder.article.title,
    articlePlaceholder.article.content,
    articlePlaceholder.article.link,
    articlePlaceholder.article.favorite)
    .then(() => {
      const data = {
        title: $('#comment-header').val(),
        body: $('#comment-body').val(),
        link: articlePlaceholder.article.link,
      };
      $.ajax({
        url: '/api/article/comment/new',
        type: 'POST',
        data,
      }).then(console.log('finished!'));
    });
});
