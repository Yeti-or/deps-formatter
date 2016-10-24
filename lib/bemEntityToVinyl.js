var fs = require('fs');

var through = require('through2');
var Vinyl = require('vinyl');

function bemEntityToVinyl() {
    return through.obj(function(entity, enc, next) {
        var bemObj = new Vinyl({path: entity.path});
        bemObj.entity = entity.entity;
        bemObj.level = entity.level;
        bemObj.tech = entity.tech;
        fs.readFile(entity.path, function(err, data) {
            if (err) {
                return next(err);
            }
            bemObj.contents = data;
            next(null, bemObj);
        });
    });
}

module.exports = bemEntityToVinyl;
