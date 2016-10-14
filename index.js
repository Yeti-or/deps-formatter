var fs = require('fs');

var bemConfig = require('bem-config')();
var betterc = require('betterc');
var bemWalk = require('bem-walk');
var bb8 = require('bb8');
var gCST = require('gulp-cst');
var through = require('through2');
var vfs = require('vinyl-fs');
var Vinyl = require('vinyl');

var bemEntityToVinyl = require('./lib/bemEntityToVinyl');
var arrayMe = require('./lib/arrayMe.js');
var formatRule = require('./lib/rules/format.js');

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

/**
 * @params {Array} files
 * @returns {Stream}
 */
function createReadableStream(files) {
    var stream = through.obj();
    files.forEach(file => stream.push(
        new Vinyl({
            path: file,
            contents: fs.readFileSync(file)
        })
    ));
    return stream;
}

/**
 * @returns {Stream}
 */
function createBemWalkStream() {
    var conf = bemConfig.levelMapSync();
    var levels = Object.keys(conf);
    if (!levels.length) {
        console.warn('No levels! Add .bemrc with levels');
        console.warn('Try to use default levels : common.blocks, ...');
        levels = [
            'common.blocks',
            'desktop.blocks',
            'deskpad.blocks',
            'touch.blocks',
            'touch-phone.blocks',
            'touch-pad.blocks'
        ];
    }

    console.log('Levels to find deps: ');
    console.log(levels);

    return bemWalk(levels)
        .pipe(bb8({
            'examples': '*blocks',
            'tests': '*blocks',
            'tmpl-specs': '*blocks'
        }))
        .pipe(filterDEPS())
        .pipe(bemEntityToVinyl());
}

var config = betterc.sync({ name: 'deps-formatter' , defaults: {
    format: 'commonjs'
}});

config = Object.assign.apply(null, config);

module.exports = fileNames =>
(
    fileNames ?
    createReadableStream(fileNames) :
    createBemWalkStream()
)
.pipe(gCST())
.pipe(formatRule(config.format.toLowerCase()))
//.pipe(arrayMe())
.pipe(through.obj((entity, _, next) => {
   // console.log(entity.path);
    next(null, entity);
}))
.pipe(vfs.dest('./'))
