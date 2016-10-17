var through = require('through2');

var Token = require('cst').Token;
var types = require('cst').types;

var $ = require('cst-helpers');
var _ = require('../utils.js');

module.exports = (isArray) => through.obj(function(file, enc, next) {
    var tree = file.tree;

    if (typeof(isArray) !== 'boolean') {
            console.error(file.path);
            console.error('unknown depsObjIsArray value: "' + isArray +
                '"\nKnown are: Boolean true && false');
            return;
    }

     _.findBemDepsProps(tree).forEach(dep => {
        var tenorok = dep.value;
        if (isArray) {
            if (tenorok.type !== 'ArrayExpression') {
                dep.replaceChild($.createArray([tenorok.cloneElement()], {multiLine: true}), dep.value);
            }
        } else {
            if (tenorok.type === 'ArrayExpression' && tenorok.elements.length === 1) {
                dep.replaceChild(tenorok.elements[0].cloneElement(), dep.value);
            }
        }
    });

    file.contents = new Buffer(tree.getSourceCode());

    next(null, file);
});
