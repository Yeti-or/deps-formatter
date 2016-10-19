var through = require('through2');

var Token = require('cst').Token;

var $ = require('cst-helpers');

var _ = require('../utils.js');

module.exports = (isShortcut) => through.obj(function(file, _, next) {
    var tree = file.tree;

    if (typeof(isShortcut) !== 'boolean') {
            if (isShortcut !== 'any') {
                console.error(file.path);
                console.error('unknown blockNameShortcut value: "' + isShortcut +
                    '"\nKnown are: Boolean "true" and "false",',
                    '\nOr string "any"');
            }
            return next(null, file);
    }

    if (isShortcut) {
        // Some cool thoughts

        // match({musDeps|shouldDeps|noDeps: [{block: "*"}] || {block: "*"}})
        // [.mustDeps] [.block][value],
        // :obj():key(mustDeps||shouldDeps)  :arr() > :obj():key(block)

        // ObjectProperty[key="mustDeps"]
        //astSelect.match('', (el) => {
        //});

        // :objkey(mustDeps) :arr() > :obj():key(block),
        // :objkey(shouldDeps) :arr() > :obj():key(block) {
        // }
        tree.selectNodesByType('ObjectExpression').forEach(el => {
            var blockName = $.getValueFromObject(el, 'block');
            if (blockName && blockName.type === 'StringLiteral') {
                var parentEl = el.parentElement;
                if (parentEl.type === 'ArrayExpression') {
                    parentEl = parentEl.parentElement;
                }

                if (parentEl.type === 'ObjectProperty') {
                    parentEl = parentEl.parentElement;
                    var parentKeys = $.getKeysFromObject(parentEl);
                    if (~parentKeys.indexOf('mustDeps') ||
                        ~parentKeys.indexOf('shouldDeps') ||
                        ~parentKeys.indexOf('noDeps')) {
                        if (el.properties.length === 1) {
                            el.parentElement.replaceChild(blockName.cloneElement(), el);
                        }
                    }
                }
            }
        });
    } else {
        // match({musDeps|shouldDeps|noDeps: ["*"] || "*"})
        tree.selectNodesByType('StringLiteral').forEach(el => {
            var parentEl = el.parentElement;
            if (parentEl.type === 'ArrayExpression') {
                parentEl = parentEl.parentElement;
            }

            if (parentEl.type === 'ObjectProperty') {
                var propKey = parentEl.key;
                if (propKey.name === 'mustDeps' ||
                    propKey.name === 'shouldDeps' ||
                    propKey.name === 'noDeps') {

                    var depsObj = $.createObject(new Map([['block', el.cloneElement()]]));
                    el.parentElement.replaceChild(depsObj, el);
                }
            }
        });
    }


    file.contents = new Buffer(tree.getSourceCode());

    next(null, file);
});
