var through = require('through2');

var Token = require('cst').Token;

var $ = require('cst-helpers');

var _ = require('../utils.js');

module.exports = (isShortcut) => through.obj(function(file, _, next) {
    var tree = file.tree;

    if (typeof(isShortcut) !== 'boolean') {
            if (String(isShortcut).toLowerCase() !== 'any') {
                console.error(file.path);
                console.error('unknown blockNameShortcut value: "' + isShortcut +
                    '"\nKnown are: Boolean "true" and "false",',
                    '\nOr string "any"');
            }
            return next(null, file);
    }

    module.exports.rule({blockNameShortcut: isShortcut})(tree);

    file.contents = new Buffer(tree.getSourceCode());

    next(null, file);
});

module.exports.rule = function(opts) {

var isShortcut = opts.blockNameShortcut;

return function(tree) {

    if (isShortcut) {
        // Some cool thoughts

        // match({musDeps|shouldDeps|noDeps: [{block: "*"}] || {block: "*"}})
        // [.mustDeps] [.block][value],
        // :obj():key(mustDeps||shouldDeps)  :arr() > :obj():key(block)

        //astSelect.match('', (el) => {
        //});

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
                        var blockName = $.getValueFromObject(obj, 'block');
                        obj.parentElement.replaceChild(blockName.cloneElement(), obj);
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
                var depsObj = $.createObject(new Map([['block', el.cloneElement()]]));
                el.parentElement.replaceChild(depsObj, el);
            }
        });
    }

};

};
