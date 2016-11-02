var through = require('through2');

var $ = require('cst-helpers');
var _ = require('../utils.js');

module.exports = (isArray, lint) => through.obj(function(file, enc, next) {
    var tree = file.tree;

    if (typeof(isArray) !== 'boolean') {
                console.error(file.path);
                console.error('unknown depsObjIsArray value: "' + isArray +
                    '"\nKnown are: Boolean "true" and "false"');
            return next(null, file);
    }

    module.exports.rule({depsObjIsArray: isArray, errors: file.errors, lint})(tree);

    lint || (file.contents = new Buffer(tree.getSourceCode()));

    next(null, file);
});

module.exports.rule = function(opts) {
    var isArray = opts.depsObjIsArray;
    var errors = opts.errors;
    var lint = opts.lint;

    return function(tree) {
        _.findBemDepsProps(tree).forEach(dep => {
            var tenorok = dep.value;
            if (isArray) {
                if (tenorok.type !== 'ArrayExpression') {
                    if (lint) {
                        errors.push('Always use array:', tenorok.getSourceCode());
                    } else {
                        // if (tenorok.getLoc().start.line !== tenorok.getLoc().end.line) {
                        //     tenorok = $.createObjectFromObject(tenorok);
                        // } else {
                             tenorok = tenorok.cloneElement();
                        // }
                        dep.replaceChild(
                            $.createArray([tenorok]),
                            dep.value
                        );
                        // _.beautyfyElement(dep);
                    }
                }
            } else {
                if (tenorok.type === 'ArrayExpression' && tenorok.elements.length === 1) {
                    if (lint) {
                        errors.push('Don\'t use array where it is unnecessary:', tenorok.getSourceCode());
                    } else {
                        tenorok = tenorok.elements[0];
                        tenorok = $.createObjectFromObject(tenorok);
                        dep.replaceChild(tenorok, dep.value);
                        // _.beautyfyElement(dep);
                    }
                }
            }
        });
    };
};
