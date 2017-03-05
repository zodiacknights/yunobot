var requireAllPath = require("path").join(__dirname);
let commands = {}
require("fs").readdirSync(requireAllPath).forEach(function(file) {
  if(file !== "index.js"){
    let fileName = file.slice(0, -3);
    commands[fileName] = require("./" + file);
  }
});

module.exports = commands;
