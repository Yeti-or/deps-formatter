var through = require('through2');

var $ = require('cst-helpers');

module.exports = (isArray) => through.obj(function(file, _, next) {
    var tree = file.tree;

    if (typeof(isArray) !== 'boolean') {
            console.error(file.path);
            console.error('unknown elemsIsArray value: "' + isArray +
                '"\nKnown are: Boolean "true" and "false"');
            return next(null, file);
    }

    module.exports.rule({elemsIsArray: isArray})(tree);

    file.contents = new Buffer(tree.getSourceCode());

    next(null, file);
});

module.exports.rule = function(opts) {

var isArray = opts.elemsIsArray;

return function(tree) {
    tree.selectNodesByType('ObjectProperty').forEach(el => {
        if (el.key.name === 'elem') {
            var dep = el.value;
            if (isArray) {
                if (dep.type !== 'ArrayExpression') {
                    el.replaceChild($.createArray([dep.cloneElement()]), dep);
                }
            } else {
                if (dep.type === 'ArrayExpression' && dep.elements.length === 1) {
                    dep = dep.elements[0];
                    el.replaceChild(dep.cloneElement(), el.value);
                }
            }
        }
    });
    // first elem then elems
    // TODO: think about this
    tree.selectNodesByType('ObjectProperty').forEach(el => {
        if (el.key.name === 'elems') {
            var dep = el.value;
            if (isArray) {
                if (dep.type !== 'ArrayExpression') {
                    el.replaceChild($.createArray([dep.cloneElement()]), dep);
                }
            } else {
                if (dep.type === 'ArrayExpression' && dep.elements.length === 1) {
                    dep = dep.elements[0];
                    el.replaceChild(dep.cloneElement(), el.value);
                }
            }
        }
    });
};

};
