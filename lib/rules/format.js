var through = require('through2');

var Token = require('cst').Token;
var types = require('cst').types;

var $ = require('cst-helpers');

var findBemDepsObjects = require('../utils.js').findBemDepsObjects;

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

    file.contents = new Buffer(tree.getSourceCode());

    next(null, file);
});

module.exports = (format) => through.obj(function(file, _, next) {
    var tree = file.tree;

    switch (format.toLowerCase()) {
        case 'expression':
        case 'objectexpression':
        case 'arrayexpression':
        case 'commonjs':
            module.exports.rule({format: format})(tree);
            break;
        case 'any':
            break;
        default:
            console.error(file.path);
            console.error('unknown deps format: "' + format + '"\nKnown are:',
                'expression', 'objectExpression', 'arrayExpression', 'and commonJS');
            break;
    }

    file.contents = new Buffer(tree.getSourceCode());

    next(null, file);
});

module.exports.rule = function(opts) {

var format = opts.format;

return function(tree) {
    switch (format.toLowerCase()) {
        case 'expression':
            wrapExpressionInBrackets(tree);
            break;
        case 'objectexpression':
            wrapExpressionInRoundBrackets(tree);
            break;
        case 'arrayexpression':
            wrapExpressionInArrayBrackets(tree);
            break;
        case 'commonjs':
            wrapExpressionInCommonJS(tree);
            break;
    }
};

};

/**
 * @params {Expression} exp
 * @returns {ExpressionStatement}
 */
function wrapElementInParentheses(exp) {
    return new types.ExpressionStatement([
        new Token('Punctuator', '('),
        exp.cloneElement(),
        new Token('Punctuator', ')'),
        new Token('Punctuator', ';')
    ]);
}

/**
 * @params {Array.<Expression>} exp
 * @returns {ExpressionStatement}
 */
function wrapElementInArrayExpressionStatement(exp) {
    return new types.ExpressionStatement([
        $.createArray(exp.map(e => e.cloneElement())),
        new Token('Punctuator', ';')
    ]);
}

function wrapExpressionInBrackets(tree) {
    var statement = tree.body[0];
    var depObjs = findBemDepsObjects(tree);

    if (depObjs.length === 1) {
        // -> ()
        statement
            .parentElement
            .replaceChild(wrapElementInParentheses(depObjs[0]), statement);
    } else {
        // -> []
        statement
            .parentElement
            .replaceChild(wrapElementInArrayExpressionStatement(depObjs), statement);
    }
}

function wrapExpressionInRoundBrackets(tree) {
    var statement = tree.body[0];
    var depObjs = findBemDepsObjects(tree);

    if (depObjs.length === 1) {
        // -> ()
        statement
            .parentElement
            .replaceChild(wrapElementInParentheses(depObjs[0]), statement);
    } else {
        // -> ()
        statement
            .parentElement
            .replaceChild(
                wrapElementInParentheses($.createArray(depObjs.map(e => e.cloneElement()))),
                statement
            );
    }
}

function wrapExpressionInArrayBrackets(tree) {
    var statement = tree.body[0];
    var depObjs = findBemDepsObjects(tree);

    depObjs.length &&
        // -> []
        statement
            .parentElement
            .replaceChild(wrapElementInArrayExpressionStatement(depObjs), statement);
}

function wrapExpressionInCommonJS(tree) {
    var root = tree.body[0];
    var statement = root;

    var our = null;
    var depObjs = findBemDepsObjects(tree);
    var exp = null;

    if (depObjs.length === 1) {
        exp = depObjs[0].cloneElement();
    } else {
        exp = $.createArray(depObjs.map(e => e.cloneElement()));
    }

    our =  new types.ExpressionStatement([
        new types.AssignmentExpression([
            new types.MemberExpression([
                new types.Identifier([
                    new Token('Identifier', 'module')
                ]),
                new Token('Punctuator', '.'),
                new types.Identifier([
                    new Token('Identifier', 'exports')
                ])
            ]),
            new Token('Whitespace', ' '),
            new Token('Punctuator', '='),
            new Token('Whitespace', ' '),
            exp
        ]),
        new Token('Punctuator', ';')
    ]);
    statement.parentElement.replaceChild(our, statement);
}
