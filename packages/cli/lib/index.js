const commander = require('commander');

const { program } = commander;
const pkg = require('../package.json');

module.exports = function(args) {
  console.log("-> args", args);
}
