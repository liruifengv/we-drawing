
const { getImageBySentence } = require('../src/get-up');
import type { Response } from '../src/types';

async function init() {
  const cwd = process.cwd();

  const argv = require('minimist')(process.argv.slice(2));
  
  if (argv.cookie) {
    try {
      const res: Response = await getImageBySentence(argv.cookie);
      console.log(res);
    } catch (e) {
      throw e
    }
  } else {
    throw new Error('Please provide a cookie using the --cookie argument');
  }
}

init().catch((e) => {
  console.error(e);
});