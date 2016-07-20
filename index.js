var fs = require('fs');

var bemConfig = require('bem-config')();
var bemWalk = require('bem-walk');
var bb8 = require('bb8');
var gCST = require('gulp-cst');
var through = require('through2');
var vfs = require('vinyl-fs');

var bemEntityToVinyl = require('./lib/bemEntityToVinyl');
// var removeBEMHTML = require('./lib/removeBEMHTML.js');
var arrayMe = require('./lib/arrayMe.js');


/*
    BEMEntity {
       entity: { block: "page" },
       level: "libs/bem-core/desktop.blocks",
       tech: "bemhtml",
       path: "libs/bem-core/desktop.blocks/page/page.bemhtml"
    }
*/

function filterDEPS() {
    return through.obj(function(entity, enc, next) {
        if (entity.tech === 'deps.js') {
            this.push(entity);
		}
		next();
    });
}

function updateMeBaby() {

var conf = bemConfig.levelMapSync();
var levels = Object.keys(conf);
if (!levels.length) {
	console.error('No levels! Add .bemrc with levels');
} else {
	console.log(levels);
}

bemWalk(levels)
.pipe(bb8({
    'examples': '*blocks',
    'tests': '*blocks',
    'tmpl-specs': '*blocks'
}))
.pipe(filterDEPS())
.pipe(bemEntityToVinyl())
.pipe(gCST())
.pipe(arrayMe())
.pipe(through.obj((entity, _, next) => {
    console.log(entity.path);
    next(null, entity);
}))
.pipe(vfs.dest('./'))

}

module.exports = updateMeBaby;
