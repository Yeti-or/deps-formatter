var fs = require('fs');

var bemConfig = require('bem-config')();
var assign = require('assign-deep');
var betterc = require('betterc');
var bemWalk = require('bem-walk');
var bb8 = require('bb8');
var gCST = require('gulp-cst');
var through = require('through2');
var vfs = require('vinyl-fs');
var Vinyl = require('vinyl');

var bemEntityToVinyl = require('bem-files-to-vinyl-fs');

var devnull = require('./lib/devnull.js');

var reporters = require('./lib/reporters');

var formatRule = require('./lib/rules/format.js');
var depsObjIsArray = require('./lib/rules/depsObjIsArray.js');
var blockNameShortcut = require('./lib/rules/blockNameShortcut.js');
var elemsIsArray = require('./lib/rules/elemsIsArray.js');

var config = betterc.sync({name: 'deps-formatter', defaults: {
    rules: {
        format: null,
        depsObjIsArray: null,
        blockNameShortcut: null,
        elemsIsArray: null
    }
}});
config = assign.apply(null, config);

var rules = config['rules'];

module.exports = function(opts) {

var lint = opts.lint;
var reporter = reporters[opts.reporter];
// TODO: what if reporter is not valid?

process.on('exit', code => {
    // console.log(`About to exit with code: ${code}`);
    // I don't understand why de f* it works like this?
    code && process.exit(code);
});

return fileNames =>
(
    fileNames ?
    createReadableStream(fileNames) :
    createBemWalkStream()
)
.pipe(gCST())

// rules begin
.pipe(rules['format'] !== null ? formatRule(rules['format'], lint) : through.obj())
.pipe(rules['depsObjIsArray'] !== null ? depsObjIsArray(rules['depsObjIsArray'], lint) : through.obj())
.pipe(rules['blockNameShortcut'] !== null ? blockNameShortcut(rules['blockNameShortcut'], lint) : through.obj())
.pipe(rules['elemsIsArray'] !== null ? elemsIsArray(rules['elemsIsArray'], lint) : through.obj())
// rules end

// .pipe(through.obj((entity, _, next) => {
//     console.log(entity.path);
//     // TODO: verbose
//     next(null, entity);
// }))
.pipe(lint ? through.obj() : vfs.dest('.'))
.pipe(reporter())
.pipe(checkForErrors())
.on('end', function() { this.__hasErrors && process.exit(2); })
.pipe(devnull);

};

/**
 * Find errors in files an show them to user
 *
 * @returns {Stream}
 */
function checkForErrors() {
    return through.obj(function(file, _, next) {
        if (file.errors.length) {
            this.__hasErrors = true;
        }
        next(null, file);
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
    stream.push(null);
    return stream;
}

/**
 * @returns {Stream}
 */
function createBemWalkStream() {
    var conf = bemConfig.levelMapSync();
    var levels = Object.keys(conf);
    if (config['levels']) {
        // get levels from .deps-formatterrc
        levels = Object.keys(config['levels']);
    }
    if (!levels.length) {
        console.warn('No levels! Add .bemrc with levels');
        // console.warn('Try to use default levels : common.blocks, ...');
        levels = [
            'common.blocks',
            'desktop.blocks',
            'deskpad.blocks',
            'touch.blocks',
            'touch-phone.blocks',
            'touch-pad.blocks'
        ];
    }

    // console.log('Levels to find deps: ');
    // console.log(levels);

    var subLevelsMasks = config['subLevelsMasks'];
    // if (subLevelsMasks) {
    //     // console.log('And subLevels masks: ');
    //     // Object.keys(subLevelsMasks).forEach(key => console.log(key + ': ', subLevelsMasks[key]));
    // }

    return bemWalk(levels)
        // extend bem-walker
        .pipe(subLevelsMasks ? bb8(subLevelsMasks) : through.obj())
        // filter deps.js
        .pipe(through.obj(function(entity, _, next) {
            next(null, entity.tech === 'deps.js' ? entity : null);
        }))
        .pipe(bemEntityToVinyl());
}
