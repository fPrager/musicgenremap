// this script downloads requests the genre map from 'http://everynoise.com/engenremap.html'
const http = require('http');
const fs = require('fs');
const camelize = require('./camelize');

const url = 'http://everynoise.com/engenremap.html';

const doRequest = () => new Promise((resolve) => {
  http.get(url, (res) => {
    res.setEncoding('utf8');
    let body = '';
    res.on('data', (data) => {
      body += data;
    });
    res.on('end', () => {
      resolve(body);
    });
  });
});

const updateJson = () => doRequest().then((dom) => {
  const items = dom.split('<div id=item');
  const genresRX = /quot;">(.*?)<a class/;
  const topRX = /top: (.*?)px;/;
  const leftRX = /left: (.*?)px;/;

  const result = {};
  const electricBounds = { min: Number.MAX_VALUE, max: Number.MIN_VALUE };
  const atmosphericBounds = { min: Number.MAX_VALUE, max: Number.MIN_VALUE };

  items.forEach((item) => {
    let genre = genresRX.exec(item);
    let electric = topRX.exec(item);
    let atmospheric = leftRX.exec(item);
    if (!genre || !electric || !atmospheric) { return; }
    genre = camelize(genre[1]);
    electric = Number(electric[1]);
    atmospheric = Number(atmospheric[1]);

    if (Number.isNaN(electric) || Number.isNaN(atmospheric)) { return; }

    result[genre] = {
      electric,
      atmospheric,
    };

    if (electric > electricBounds.max) electricBounds.max = electric;
    if (electric < electricBounds.min) electricBounds.min = electric;
    if (atmospheric > atmosphericBounds.max) atmosphericBounds.max = atmospheric;
    if (atmospheric < atmosphericBounds.min) atmosphericBounds.min = atmospheric;
  });

  if (Object.keys(result).length === 0) {
    // something went wrong here :(
    throw (new Error('Can#t fetch genres from dom. The dom syntax of Every Noise At Once maybe changed.'));
  }

  // normalize genre space
  Object.keys(result).forEach((genre) => {
    result[genre].electric =
        (result[genre].electric - electricBounds.min) /
            (electricBounds.max - electricBounds.min);
    result[genre].atmospheric =
        (result[genre].atmospheric - atmosphericBounds.min) /
            (atmosphericBounds.max - atmosphericBounds.min);
  });

  fs.writeFileSync('genreMap.json', JSON.stringify(result));
});

module.exports = updateJson;
