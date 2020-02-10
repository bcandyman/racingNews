let commentLinkHolder = '';

$('.save-article').click(function() {
  const parentElmnt = $(this)
    .parent()
    .find('a');

  const data = {
    title: parentElmnt.find('H3').text(),
    content: parentElmnt.find('H6').text(),
    link: $(this).attr('data-link'),
    favorite: true,
  };
  $.ajax({
    url: '/api/article/favorite/save',
    type: 'POST',
    data,
  }).then(window.location.reload());
});

$('.view-comments').click(function() {
  console.log("asdfsf");
  
  const data = { link: $(this).attr('data-link') };
  $.ajax({
    url: '/api/article/comments',
    type: 'GET',
    data,
  }).then((res) => {
    // record article identity in case user creates a new comment
    commentLinkHolder = res.link;
    console.log(commentLinkHolder);
    

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
  const data = {
    title: $('#comment-header').val(),
    body: $('#comment-body').val(),
    link: commentLinkHolder,
  };
  $.ajax({
    url: '/api/article/comment/new',
    type: 'POST',
    data,
  }).then(console.log('finished!'));
});
