'use strict'

const fs = require('fs');
const request = require('request');

const {API_KEY, API_SECRET, CLOUD_NAME} = require('./cloudinaryApiKeys');
console.log("If these are displayed as ****, update file cloudinaryApiKeys.js.", API_KEY, API_SECRET, CLOUD_NAME);
const base_url = 'https://' + API_KEY + ':' + API_SECRET + '@api.cloudinary.com/v1_1/' + CLOUD_NAME + '/resources/image?max_results=500';

const downloadImage = (uri, filename) => {
  request.head(uri, function(err, res, body){
    request(uri).pipe(
      fs.createWriteStream('./downloads/' + filename)
    ).on('close', () => console.log('downloaded', filename));
  });
};

const downloadImages = async (list) => {
  console.log('number of images in list:', list.length);
  for (const img of list) {
    const {url, secure_url, public_id, format} = img;
    const filename = public_id.replace(/\//g, '_') + '.' + format;
    await downloadImage(url, filename);
  }
}

const getImageList = (url) => {
  return new Promise((resolve, reject) => {
    const https = require('https');

    https.get(url, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        resolve(data);
      });

    }).on("error", (err) => {
      reject(err);
    });
  });
};

const getImageLists = async (url, list = []) => {
  console.log('in getImageLists', list.length)
  const data = await getImageList(url);
  const {resources, next_cursor = null} = JSON.parse(data);
  list = [...resources, ...list]
  if (next_cursor) {
    console.log('in getImageLists, if next_cursor', next_cursor, list.length)
    const next_url = base_url + '&next_cursor=' + next_cursor;
    getImageLists(next_url, list);
  } else {
    console.log('in getImageLists, if not next_cursor', next_cursor, list.length)
    downloadImages(list)
  }
}

(getImageLists(base_url));
