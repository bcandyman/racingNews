
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
  console.log(this);
});
