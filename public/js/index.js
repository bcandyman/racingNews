/* eslint-disable no-underscore-dangle */
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
  const parentElmnt = $(this).parents('.article-parent').find('a');
  const title = parentElmnt.find('H3').text();
  const content = parentElmnt.find('H6').text();
  const link = $(this).attr('data-link');
  const favorite = true;

  saveArticleToDb(title, content, link, favorite)
    .then(window.location.reload());
});

$('.view-comments').click(function() {
  const parentElmnt = $(this).parents('.article-parent').find('a');
  articlePlaceholder.article.title = parentElmnt.find('H3').text();
  articlePlaceholder.article.content = parentElmnt.find('H6').text();
  articlePlaceholder.article.link = $(this).attr('data-link');
  articlePlaceholder.article.favorite = false;

  console.log(articlePlaceholder.article);


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
      const deleteButton = $('<button>').addClass('btn btn-primary delete-comment')
        .attr('data-comment-id', element._id);
      const deleteIcon = $('<i>').addClass('far fa-trash-alt');
      const hr = $('<hr>');

      deleteButton.append(deleteIcon);

      parentDiv.append(title);
      parentDiv.append(body);
      parentDiv.append(deleteButton);
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
      }).then(() => {
        $('#comment-header').val('');
        $('#comment-body').val('');
        window.location.reload();
      });
    });
});


$(document).on('click', '.delete-comment', function() {
  console.log($(this).attr('data-comment-id'));
});

$(document).ready(() => {
  const { pathname } = window.location;
  $(`.navbar-nav > li > a[href="${pathname}"]`).parent().addClass('active');
});
