var through = require('through2');
var Warnie = require('warnie');

var $ = require('cst-helpers');
var _ = require('../utils.js');

module.exports = (isArray, lint) => through.obj(function(file, enc, next) {
    var tree = file.tree;

    var errors = [];

    // TODO: Move to index.js
    // if (typeof(isArray) !== 'boolean') {
    //             console.error(file.path);
    //             console.error('unknown depsObjIsArray value: "' + isArray +
    //                 '"\nKnown are: Boolean "true" and "false"');
    //         return next(null, file);
    // }

    module.exports.rule({depsObjIsArray: isArray, errors, lint})(tree);

    lint || (file.contents = new Buffer(tree.getSourceCode()));

    file.errors = (file.errors || []).concat(errors.map(error => {
        // normalize errors
        error.filename = file.path;
        error.line -= 1;
        error.column += 1;
        error.severity = 1;
        return error;
    }));

    next(null, file);
});

module.exports.rule = function(opts) {
    var isArray = opts.depsObjIsArray;
    var errors = opts.errors;
    var lint = opts.lint;

    return function(tree) {
        _.findBemDepsProps(tree).forEach(dep => {
            var tenorok = dep.value;
            var error;
            var loc;
            if (isArray) {
                if (tenorok.type !== 'ArrayExpression') {
                    if (lint) {
                        error = new Warnie('Always use array for Deps');
                        loc = tenorok.getLoc().start;
                        error.line = loc.line;
                        error.column = loc.column;
                        errors.push(error);
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
                        error = new Warnie('Don\'t use array for Deps where it is unnecessary');
                        loc = tenorok.getLoc().start;
                        error.line = loc.line;
                        error.column = loc.column;
                        errors.push(error);
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
