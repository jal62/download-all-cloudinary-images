'use strict'

const {API_KEY, API_SECRET, CLOUD_NAME} = require('./cloudinaryApiKeys');
console.log(API_KEY, API_SECRET, CLOUD_NAME);
const url = 'https://' + API_KEY + ':' + API_SECRET + '@api.cloudinary.com/v1_1/' + CLOUD_NAME + '/resources/image?max_results=500';
console.log(url);
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

(async (url) => {  
  let data = await getImageList(url)
  data = JSON.parse(data)
  console.log(data.resources.length);
})(url);
