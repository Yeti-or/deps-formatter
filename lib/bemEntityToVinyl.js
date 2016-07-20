var fs = require('fs');

var through = require('through2');
var Vinyl = require('vinyl');

function bemEntityToVinyl() {
    return through.obj(function(entity, enc, next) {
        var bemObj = new Vinyl({path: entity.path});
        bemObj.entity = entity.entity;
        bemObj.level = entity.level;
        bemObj.tech = entity.tech;
        bemObj.contents = fs.readFileSync(entity.path);
        next(null, bemObj);
    });
}

module.exports = bemEntityToVinyl;
