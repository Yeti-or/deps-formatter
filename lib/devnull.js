var Writable = require('stream').Writable

var devnull = new Writable({ objectMode: true });
devnull._write = (data, enc, next) => next();

module.exports = devnull;
