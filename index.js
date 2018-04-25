const updateGenres = require('./util/update-genre-json');

let finish = false;

updateGenres().then(() => {
  finish = true;
});

/*(function wait() {
  if (!finish) setTimeout(wait, 1000);
}()); */
