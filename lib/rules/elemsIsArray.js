var through = require('through2');
var Warnie = require('warnie');

var $ = require('cst-helpers');

module.exports = (isArray, lint) => through.obj(function(file, _, next) {
    var tree = file.tree;
    var errors = [];

    // TODO: Move to index.js
    // if (typeof(isArray) !== 'boolean') {
    //         console.error(file.path);
    //         console.error('unknown elemsIsArray value: "' + isArray +
    //             '"\nKnown are: Boolean "true" and "false"');
    //         return next(null, file);
    // }

    module.exports.rule({elemsIsArray: isArray, lint, errors})(tree);

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

var isArray = opts.elemsIsArray;
var lint = opts.lint;
var errors = opts.errors;

return function(tree) {
    var nodes = [];
    var wasRemoved = [];

    // var addElements = function(elems) {
    //     for (let i = 0; i < elems.length; i++) {
    //        addElementTree(elems[i]);
    //     }

    //     function addElementTree(element) {
    //         if (!element.isToken) {
    //             nodes.push(element);
    //             let child = element.firstChild;
    //             while (child) {
    //                 addElementTree(child);
    //                 child = child.nextSibling;
    //             }
    //         }
    //     }
    // };

    var removeElements = function(elems) {
        for (var i = 0; i < elems.length; i++) {
            addElementTree(elems[i]);
        }

        function addElementTree(element) {
            if (!element.isToken) {
                wasRemoved.push(element);
                var child = element.firstChild;
                while (child) {
                    addElementTree(child);
                    child = child.nextSibling;
                }
            }
        }
    };

    // tree.on('elements-add', addElements);
    tree.on('elements-remove', removeElements);
    // :deps() > ObjectExpression > ObjectProperty[key=elem|elems],
    // :deps() > ArrayExpression > ObjectExpression > ObjectProperty[key=elem|elems]
    nodes = tree.selectNodesByType('ObjectProperty');
    nodes.forEach(el => {
        if (~wasRemoved.indexOf(el)) { return; }
        if (el.key.name === 'elem' || el.key.name === 'elems') {
            var dep = el.value;

            var parentEl = el.parentElement.parentElement;
            if (parentEl.type === 'ArrayExpression') {
                parentEl = parentEl.parentElement;
            }

            if (parentEl.type === 'ObjectProperty') {
                if (parentEl.key.name === 'mustDeps' ||
                    parentEl.key.name === 'shouldDeps' ||
                    parentEl.key.name === 'noDeps') {

                    var error;
                    var loc;
                    // actual rule
                    if (isArray) {
                        if (dep.type !== 'ArrayExpression') {
                            if (lint) {
                                error = new Warnie('Always use array for ' + el.key.name);
                                loc = dep.getLoc().start;
                                error.line = loc.line;
                                error.column = loc.column;
                                errors.push(error);
                            } else {
                                el.replaceChild($.createArray([dep.cloneElement()]), dep);
                            }
                        }
                    } else {
                        if (dep.type === 'ArrayExpression' && dep.elements.length === 1) {
                            if (lint) {
                                error = new Warnie('Don\'t use array for ' + el.key.name + ' where it is unnecessary');
                                loc = dep.getLoc().start;
                                error.line = loc.line;
                                error.column = loc.column;
                                errors.push(error);
                            } else {
                                dep = dep.elements[0];
                                el.replaceChild(dep.cloneElement(), el.value);
                            }
                        }
                    }
                }
            }
        }
    });

    // tree.off('elements-add', addElements);
    tree.off('elements-remove', removeElements);

    //  first elem then elems
    //  TODO: think about this
    // tree.selectNodesByType('ObjectProperty').forEach(el => {
    //     if (el.key.name === 'elems') {
    //         var dep = el.value;
    //         if (isArray) {
    //             if (dep.type !== 'ArrayExpression') {
    //                 el.replaceChild($.createArray([dep.cloneElement()]), dep);
    //             }
    //         } else {
    //             if (dep.type === 'ArrayExpression' && dep.elements.length === 1) {
    //                 dep = dep.elements[0];
    //                 el.replaceChild(dep.cloneElement(), el.value);
    //             }
    //         }
    //     }
    // });
};

};
