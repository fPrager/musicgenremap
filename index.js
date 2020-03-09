const updateGenres = require('./util/update-genre-json');

let finish = false;

updateGenres().then(() => {
  console.log('updated genreMap.json');
  finish = true;
});

/*(function wait() {
  if (!finish) setTimeout(wait, 1000);
}()); */
