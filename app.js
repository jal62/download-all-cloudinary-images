'use strict'

const fs = require('fs');
const request = require('request');

const {API_KEY, API_SECRET, CLOUD_NAME} = require('./cloudinaryApiKeys');
// console.log(API_KEY, API_SECRET, CLOUD_NAME);
const base_url = 'https://' + API_KEY + ':' + API_SECRET + '@api.cloudinary.com/v1_1/' + CLOUD_NAME + '/resources/image?max_results=500';
// console.log(base_url);

const downloadImage = (uri, filename) => {
  request.head(uri, function(err, res, body){
    request(uri).pipe(
      fs.createWriteStream('./downloads/' + filename)
    ).on('close', () => console.log('downloaded', filename));
  });
};

const downloadImages = (resources) => {
  console.log('number of images in list:', resources.length);
  for (const img of resources) {
    const {url, secure_url, public_id, format} = img;
    const filename = public_id.replace(/\//g, '_') + '.' + format;
    // downloadImage(url, filename);
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

const getImageLists = async (url) => {
  const data = await getImageList(url);
  const {resources, next_cursor = null} = JSON.parse(data);
  downloadImages(resources)
  // console.log('next list:', next_cursor);
  if (next_cursor) {
    const next_url = base_url + '&next_cursor=' + next_cursor;
    // console.log('next_url:', next_url);
    getImageLists(next_url);
  }
}

(getImageLists(base_url));
