var through = require('through2');

var Token = require('cst').Token;
var types = require('cst').types;

var $ = require('cst-helpers');

var findBemDepsObjects = require('../utils.js').findBemDepsObjects;

module.exports = (format, lint) => through.obj(function(file, _, next) {
    var tree = file.tree;

    switch (format && format.toLowerCase()) {
        case 'expression':
        case 'objectexpression':
        case 'arrayexpression':
        case 'commonjs':
            module.exports.rule({format: format, errors: file.errors, lint})(tree);
            break;
        default:
            console.error(file.path);
            console.error('unknown deps format: "' + format + '"\nKnown are:',
                'expression', 'objectExpression', 'arrayExpression', 'and commonJS');
            break;
    }

    lint || (file.contents = new Buffer(tree.getSourceCode()));

    next(null, file);
});

module.exports.rule = function(opts) {

var format = opts.format;

return function(tree) {
    switch (format.toLowerCase()) {
        case 'expression':
            wrapExpressionInBrackets(tree, opts);
            break;
        case 'objectexpression':
            wrapExpressionInRoundBrackets(tree, opts);
            break;
        case 'arrayexpression':
            wrapExpressionInArrayBrackets(tree, opts);
            break;
        case 'commonjs':
            wrapExpressionInCommonJS(tree, opts);
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

function wrapExpressionInBrackets(tree, opts) {
    var statement = tree.body[0];

    var lint = opts.lint;
    var errors = opts.errors;

    if (lint) {
        if (statement.expression.type !== 'ArrayExpression' &&
            statement.expression.type !== 'ObjectExpression') {
            errors.push('Expected format: expression',
                'but get ' + statement.expression.type);
        }
    }

    var depObjs = findBemDepsObjects(tree);
    if (depObjs.length === 1) {
        // -> ()
        if (lint) {
            if (statement.expression.type === 'ArrayExpression') {
                errors.push('Expected format: expression',
                    'but get ArrayExpression, use ObjectExpression where it is possible');
            }
        } else {
            statement
                .parentElement
                .replaceChild(wrapElementInParentheses(depObjs[0]), statement);
        }
    } else {
        // -> []
        if (lint) {
            if (statement.firstChild.value === '(') {
                errors.push('Expected format: expression',
                    'but get ([{..., use just [{... where it is possible');
            }
        } else {
            statement
                .parentElement
                .replaceChild(wrapElementInArrayExpressionStatement(depObjs), statement);
        }
    }
}

function wrapExpressionInRoundBrackets(tree, opts) {
    var statement = tree.body[0];

    var lint = opts.lint;
    var errors = opts.errors;

    if (lint) {
        if (statement.expression.type !== 'ObjectExpression') {
            errors.push('Expected format: ObjectExpression',
                'but get ' + statement.expression.type);
        }
        return;
    }

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

function wrapExpressionInArrayBrackets(tree, opts) {
    var statement = tree.body[0];

    var lint = opts.lint;
    var errors = opts.errors;

    if (lint) {
        if (statement.expression.type !== 'ArrayExpression') {
            errors.push('Expected format: ArrayExpression',
                'but get ' + statement.expression.type);
        }
        return;
    }

    var depObjs = findBemDepsObjects(tree);
    depObjs.length &&
        // -> []
        statement
            .parentElement
            .replaceChild(wrapElementInArrayExpressionStatement(depObjs), statement);
}

function wrapExpressionInCommonJS(tree, opts) {
    var root = tree.body[0];
    var statement = root;

    var lint = opts.lint;
    var errors = opts.errors;

    if (lint) {
        if (statement.expression.type !== 'AssignmentExpression') {
            errors.push('Expected format: commonJS',
                'but get ' + statement.expression.type);
        }
        return;
    }

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
