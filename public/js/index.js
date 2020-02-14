$('#scrape-data').click(() => {
  $.ajax({
    url: '/api/scrape',
    type: 'GET',
  }).then(window.location.reload());
});


