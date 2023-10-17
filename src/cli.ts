import "dotenv/config";

import {BingImageCreator} from './bing-image-creator';

console.log('Hello, world!')

const bingImageCreator = new BingImageCreator({
  cookie: process.env.BING_COOKIE || '',
});

bingImageCreator.createImage('白日依山尽，黄河入海流').then((images) => {
  console.log("create Success", images);
});