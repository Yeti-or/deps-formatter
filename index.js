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
var depsObjIsArray = require('./lib/rules/depsObjIsArray.js');
var blockNameShortcut = require('./lib/rules/blockNameShortcut.js');

var $ = require('cst-helpers');
var devnull = require('./lib/devnull');
var del = require('del');

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
            'blocks-common',
            'blocks-deskpad',
            'blocks-desktop',
            'blocks-touch-phone',
            'contribs'
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
    format: 'commonjs',
    depsObjIsArray: false,
    blockNameShortcut: false
}});


function removeEmpty(el) {
    var next = el.parentElement;
    if (next.type === 'ArrayExpression') {
        $.removeElementFromArray(next, el);
        next.elements.length === 0 && removeEmpty(next);
    }
    if (next.type === 'ObjectExpression') {
        $.removePropertyFromObject(next, el);
        //$.removePropertyFromObjectByKeyName(next, 'tech');
        next.properties.length === 0 && removeEmpty(next);
    }
    if (next.type === 'ObjectProperty') {
        removeEmpty(next);
    }
}


config = Object.assign.apply(null, config);

module.exports = fileNames =>
(
    fileNames ?
    createReadableStream(fileNames) :
    createBemWalkStream()
)
.pipe(gCST())
//rules begin
//.pipe(formatRule(config['format'].toLowerCase()))
//.pipe(depsObjIsArray(config['depsObjIsArray']))
//.pipe(blockNameShortcut(config['blockNameShortcut']))
.pipe(through.obj((entity, _, next) => {
    var tree = entity.tree;

    // ObjectProperty[key="noDeps"]
    tree.selectNodesByType('ObjectProperty').forEach(el => {
        if (el.key.name === 'noDeps' || el.key.value === 'noDeps') {
            var obj = el.parentElement;
            if (obj) {
                console.log(entity.path);
                removeEmpty(el);
            }
        }
    });

    var ee = tree.body[0] && tree.body[0].expression;


    if (ee && ee.type === 'ArrayExpression' && ee.elements.length === 0) {
        // we will remove such deps in build.js
        entity.contents = new Buffer('');
    } else if (ee && ee.type === 'ObjectExpression' && ee.properties.length === 0) {
        // we will remove such deps in build.js
        entity.contents = new Buffer('');
    } else {
      entity.contents = new Buffer(tree.getSourceCode());
    }

    next(null, entity);
}))
//rules end
.pipe(through.obj((entity, _, next) => {
//    console.log(entity.path);
    // TODO: verbose
    next(null, entity);
}))
.pipe(vfs.dest('./'))

.pipe(through.obj((file, _, next) => {
    if (!file.contents.length) {
        del(file.path);
    }
    next(null, file);
}))
.pipe(devnull);

