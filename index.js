var fs = require('fs');

var bemConfig = require('bem-config')();
var betterc = require('betterc');
var bemWalk = require('bem-walk');
var bb8 = require('bb8');
var gCST = require('gulp-cst');
var through = require('through2');
var vfs = require('vinyl-fs');
var Vinyl = require('vinyl');

var bemEntityToVinyl = require('bem-files-to-vinyl-fs');

var formatRule = require('./lib/rules/format.js');
var depsObjIsArray = require('./lib/rules/depsObjIsArray.js');
var blockNameShortcut = require('./lib/rules/blockNameShortcut.js');

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
    if (config['levels']) {
        // get levels from .deps-formaterrc
        levels = Object.keys(config['levels']);
    }
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

    var subLevelsMasks = config['subLevelsMasks'];
    if (subLevelsMasks) {
        console.log('And subLevels masks: ');
        Object.keys(subLevelsMasks).forEach(key => console.log(key + ': ', subLevelsMasks[key]));
    }

    return bemWalk(levels)
        // extend bem-walker
        .pipe(subLevelsMasks ? bb8(subLevelsMasks) : through.obj())
        // filter deps.js
        .pipe(through.obj(function(entity, _, next) {
            next(null, entity.tech === 'deps.js' ? entity : null);
        }))
        .pipe(bemEntityToVinyl());
}

var config = betterc.sync({name: 'deps-formatter', defaults: {
    rules: {
        format: null,
        depsObjIsArray: null,
        blockNameShortcut: null
    }
}});

config = Object.assign.apply(null, config);

var rules = config['rules'];

module.exports = fileNames =>
(
    fileNames ?
    createReadableStream(fileNames) :
    createBemWalkStream()
)
.pipe(gCST())
// rules begin
.pipe(formatRule(rules['format']))
.pipe(depsObjIsArray(rules['depsObjIsArray']))
.pipe(blockNameShortcut(rules['blockNameShortcut']))
// rules end
.pipe(through.obj((entity, _, next) => {
    // console.log(entity.path);
    // TODO: verbose
    next(null, entity);
}))
.pipe(vfs.dest('.'));
