const requireAllPath = require('path').join(__dirname);

const commands = {};
require('fs').readdirSync(requireAllPath).forEach((file) => {
  if (file !== 'index.js') {
    const fileName = file.slice(0, file.lastIndexOf('.'));
    // eslint-disable-next-line global-require, import/no-dynamic-require
    commands[fileName] = require(`./${file}`);
  }
});

module.exports = commands;
