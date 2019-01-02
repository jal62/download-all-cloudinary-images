'use strict'

const fs = require('fs');
const request = require('request');

const {API_KEY, API_SECRET, CLOUD_NAME} = require('./cloudinaryApiKeys');
console.log("If these are displayed as ****, update file cloudinaryApiKeys.js.", API_KEY, API_SECRET, CLOUD_NAME);
const base_url = 'https://' + API_KEY + ':' + API_SECRET + '@api.cloudinary.com/v1_1/' + CLOUD_NAME + '/resources/image?max_results=5';

const downloadImage = (img) => {
  const {url, secure_url, public_id, format} = img;
  const filename = public_id.replace(/\//g, '_') + '.' + format;
  request.head(url, function(err, res, body){
    request(url).pipe(
      fs.createWriteStream('./downloads/' + filename)
    ).on('close', () => console.log('downloaded', filename));
  });
};

const downloadImages = (list) => {
  console.log('Total number of images ids in list:', list.length, list);
  for (const img of list) {
    downloadImage(img)
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
  const data = await getImageList(url);
  const {resources, next_cursor = null} = JSON.parse(data);
  list = [...list, ...resources]
  if (!next_cursor) {
    console.log('fetched', list.length, 'image ids');
    const next_url = base_url + '&next_cursor=' + next_cursor;
    getImageLists(next_url, list);
  } else {
    downloadImages(list)
  }
}

(getImageLists(base_url));
