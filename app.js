'use strict'

const fs = require('fs');
const request = require('request');

const {API_KEY, API_SECRET, CLOUD_NAME} = require('./cloudinaryApiKeys');
console.log(API_KEY, API_SECRET, CLOUD_NAME);
const list_url = 'https://' + API_KEY + ':' + API_SECRET + '@api.cloudinary.com/v1_1/' + CLOUD_NAME + '/resources/image?max_results=500';
console.log(list_url);

const getImageList = (url) => {
  return new Promise((resolve, reject) => {
    const https = require('https');

    https.get(url, (resp) => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        resolve(data);
      });

    }).on("error", (err) => {
      reject(err);
    });
  });
};

const downloadImage = (uri, filename) => {
  request.head(uri, function(err, res, body){
    request(uri).pipe(
      fs.createWriteStream('./downloads/' + filename)
    ).on('close', () => console.log('downloaded', filename));
  });
};

const downloadImages = (data) => {
  const {resources, next_cursor = null} = JSON.parse(data);
  console.log(resources.length, next_cursor);

  for (const img of resources) {
    const {url, secure_url, public_id, format} = img;
    const filename = public_id.replace(/\//g, '_') + '.' + format;
    downloadImage(url, filename);
  }
}

(async (url) => {  
  downloadImages(await getImageList(url))
})(list_url);
