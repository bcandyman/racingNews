/* eslint-disable no-underscore-dangle */
let articleId = '';

const prependComment = (comment) => {
  const commentDiv = $('<div>').attr('data-comment-id', comment._id);
  const titleDiv = $('<div>');
  const titleElement = $('<h6>').text(comment.title);
  const bodyDiv = $('<div>').text(comment.body);
  const hr = $('<hr>');
  const deleteBtn = $('<button>').addClass('btn btn-link delete-comment').text('Delete Comment');

  titleDiv.append(titleElement);

  commentDiv.append(titleDiv);
  commentDiv.append(bodyDiv);
  commentDiv.append(deleteBtn);
  commentDiv.append(hr);

  $('.existing-comments').prepend(commentDiv);
};


$('#scrape-data').click(() => {
  $.ajax({
    url: '/api/scrape',
    method: 'GET',
  }).done(() => {
    window.location.reload();
  });
});


$('.view-comments').click(function() {
  // record article id that has been opened
  articleId = $(this)
    .parents('.article-parent')
    .attr('data-id');
  // empty existing comments from the div
  $('.existing-comments').empty();
  $.ajax({
    url: '/api/article/comments',
    method: 'GET',
    data: { articleId },
  }).done((incomingData) => {
    // a ppend all comments to '.existing-comments'.
    incomingData.forEach((element) => prependComment(element));
  });
});


$('#submit-comment').click(() => {
  $.ajax({
    url: '/api/comment/new',
    method: 'POST',
    data: {
      articleId,
      title: $('#comment-title').val(),
      body: $('#comment-body').val(),
    },
  }).done((data) => {
    prependComment(data);
    $('#comment-title').val('');
    $('#comment-body').val('');
  });
});


$(document).on('click', '.delete-comment', function() {
  const commentId = ($(this).parents('div[data-comment-id]')
    .attr('data-comment-id'));

  $.ajax({
    url: '/api/comment/delete',
    method: 'DELETE',
    data: {
      commentId,
      articleId,
    },
  }).done((removedItem) => {
    $(`div[data-comment-id=${removedItem._id}]`).remove();
  });
});

$('#myModal').on('hide.bs.modal', () => window.location.reload());
