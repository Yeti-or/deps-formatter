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
                //if (tenorok.getLoc().start.line !== tenorok.getLoc().end.line) {
                //    tenorok = $.createObjectFromObject(tenorok);
                //} else {
                    tenorok = tenorok.cloneElement();
                //}
                dep.replaceChild(
                    $.createArray([tenorok], {multiLine: true}),
                    dep.value
                );
                _.beautyfyElement(dep);
            }
        } else {
            if (tenorok.type === 'ArrayExpression' && tenorok.elements.length === 1) {
                tenorok = tenorok.elements[0];
                tenorok = $.createObjectFromObject(tenorok, {multiLine: true});
                dep.replaceChild(tenorok, dep.value);
                _.beautyfyElement(dep);
            }
        }
    });

    file.contents = new Buffer(tree.getSourceCode());

    next(null, file);
});
