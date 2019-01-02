'use strict'

const fs = require('fs');
const request = require('request');

const {API_KEY, API_SECRET, CLOUD_NAME} = require('./cloudinaryApiKeys');
console.log("If these are displayed as ****, update file cloudinaryApiKeys.js.", API_KEY, API_SECRET, CLOUD_NAME);
const base_url = 'https://' + API_KEY + ':' + API_SECRET + '@api.cloudinary.com/v1_1/' + CLOUD_NAME + '/resources/image?max_results=10';

const downloadImage = async (uri, filename) => {
  request.head(uri, function(err, res, body){
    request(uri).pipe(
      fs.createWriteStream('./downloads/' + filename)
    ).on('close', () => console.log('downloaded', filename));
  });
};

const iterateImages = async (resources) => {
  for (const img of resources) {
    const {url, secure_url, public_id, format} = img;
    const filename = public_id.replace(/\//g, '_') + '.' + format;
    await downloadImage(url, filename);
  }
};

const downloadImages = async (data) => {
  const {resources, next_cursor = null} = JSON.parse(data);
  console.log('number of images in list:', resources.length);
  const iterated = await iterateImages(resources);
  console.log('iterated returned:', iterated);
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

  const next_cursor = await downloadImages(data)
  if (next_cursor) {
    const next_url = base_url + '&next_cursor=' + next_cursor;
    getImageLists(next_url);
  }
}

(getImageLists(base_url));
