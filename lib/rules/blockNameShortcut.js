var through = require('through2');
var Warnie = require('warnie');

var $ = require('cst-helpers');

module.exports = (isShortcut, lint) => through.obj(function(file, _, next) {
    var tree = file.tree;
    var errors = [];

    // TODO: Move to index.js
    // if (typeof(isShortcut) !== 'boolean') {
    //         console.error(file.path);
    //         console.error('unknown blockNameShortcut value: "' + isShortcut +
    //             '"\nKnown are: Boolean "true" and "false"');
    //         return next(null, file);
    // }

    module.exports.rule({blockNameShortcut: isShortcut, lint, errors})(tree);

    lint || (file.contents = new Buffer(tree.getSourceCode()));

    file.errors = (file.errors || []).concat(errors.map(error => {
        // normalize errors
        error.filename = file.path;
        // error.line -= 1;
        error.column += 1;
        error.severity = 1;
        return error;
    }));

    next(null, file);
});

module.exports.rule = function(opts) {

var isShortcut = opts.blockNameShortcut;
var lint = opts.lint;
var errors = opts.errors;

return function(tree) {

    if (isShortcut) {
        // Some cool thoughts

        // match({musDeps|shouldDeps|noDeps: [{block: "*"}] || {block: "*"}})
        // [.mustDeps] [.block][value],
        // :obj():key(mustDeps||shouldDeps)  :arr() > :obj():key(block)

        // astSelect.match('', (el) => {
        // });

        // :objkey(mustDeps) :arr() > :obj():key(block),
        // :objkey(shouldDeps) :arr() > :obj():key(block) {
        // }

        // ObjectProperty[key="mustDeps"] ObjectProperty[key="block"],
        // ObjectProperty[key="shouldDeps"] ObjectProperty[key="block"],
        // ObjectProperty[key="noDeps"] ObjectProperty[key="block"],
        tree.selectNodesByType('ObjectProperty').forEach(el => {
            var parentEl = el.parentElement;
            if (el.key.name === 'block') {

                // how to chek for root?
                while (!parentEl.body && parentEl.type !== 'ObjectProperty') {
                    parentEl = parentEl.parentElement;
                }

                var propKey = parentEl.key;
                if (propKey.name === 'mustDeps' ||
                    propKey.name === 'shouldDeps' ||
                    propKey.name === 'noDeps') {

                    // actual rule
                    var obj = el.parentElement;
                    if (obj.properties.length === 1) {
                        if (lint) {
                            var error = new Warnie('Use blockNameShortcut');
                            var loc = obj.getLoc().start;
                            error.line = loc.line;
                            error.column = loc.column;
                            errors.push(error);
                        } else {
                            var blockName = $.getValueFromObject(obj, 'block');
                            obj.parentElement.replaceChild(blockName.cloneElement(), obj);
                        }
                    }
                }
            }
        });
    } else {
        // match({musDeps|shouldDeps|noDeps: "*"})
        tree.selectNodesByType('StringLiteral').forEach(el => {
            var parentEl = el.parentElement;

            // how to chek for root?
            while (!parentEl.body && parentEl.type !== 'ObjectProperty') {
                parentEl = parentEl.parentElement;
            }

            var propKey = parentEl.key;
            if (propKey.name === 'mustDeps' ||
                propKey.name === 'shouldDeps' ||
                propKey.name === 'noDeps') {

                // actual rule
                if (lint) {
                    var error = new Warnie('Don\'t use blockNameShortcut');
                    var loc = el.getLoc().start;
                    error.line = loc.line;
                    error.column = loc.column;
                    errors.push(error);
                } else {
                    var depsObj = $.createObject(new Map([['block', el.cloneElement()]]));
                    el.parentElement.replaceChild(depsObj, el);
                }
            }
        });
    }

};

};
