var through = require('through2');
var Warnie = require('warnie');
var chalk = require('chalk');

Warnie.shadowDye = chalk.gray;
Warnie.messageDye = chalk.yellow;
Warnie.filenameDye = chalk.cyan;

module.exports = function() {
    var errorsCount = 0;
    return through.obj(function(file, enc, next) {
        var fileContent = file.contents.toString(enc);
        file.errors.forEach(error => {
            errorsCount++;
            console.log(error.explain(fileContent.split('\n')));
        });
        next(null, file);
    })
    .on('end', () => {
        console.log('\nErrors found: ' + chalk.red(errorsCount));
    });
};
