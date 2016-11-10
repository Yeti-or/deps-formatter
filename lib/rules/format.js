var through = require('through2');
var Warnie = require('warnie');

var Token = require('cst').Token;
var types = require('cst').types;

var $ = require('cst-helpers');

module.exports = (format, lint) => through.obj(function(file, _, next) {
    var tree = file.tree;
    var errors = [];

    switch (format && format.toLowerCase()) {
        case 'expression':
        case 'objectexpression':
        case 'arrayexpression':
        case 'commonjs':
            module.exports.rule({format, errors, lint})(tree);
            break;
        default:
            console.error(file.path);
            console.error('unknown deps format: "' + format + '"\nKnown are:',
                'expression', 'objectExpression', 'arrayExpression', 'and commonJS');
            break;
    }

    lint || (file.contents = new Buffer(tree.getSourceCode()));

    file.errors = (file.errors || []).concat(errors.map(error => {
        // normalize errors
        error.filename = file.path;
        // error.line -= 1;
        error.column += 1;
        error.severity = 1;
        return error;
    }));

    next(null, file);
});

module.exports.rule = function(opts) {

var format = opts.format.toLowerCase();

return function(tree) {

    var lint = opts.lint;
    var errors = opts.errors;

    var nodes = [];
    var wasRemoved = [];

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

    tree.on('elements-remove', removeElements);

    // TODO: https://github.com/bem/bem-components/blob/v3/design/common.blocks/dropdown/_theme/dropdown_theme_islands.deps.js
    //       https://github.com/bem/bem-components/blob/v3/design/common.blocks/checkbox/_theme/checkbox_theme_islands.deps.js

    // :root > ExpressionStatement > AssignmentExpression,
    // :root > ExpressionStatement > ObjectExpression,
    // :root > ExpressionStatement > ArrayExpression
    nodes = tree.selectNodesByType('AssignmentExpression')
        .concat(tree.selectNodesByType('ObjectExpression'))
        .concat(tree.selectNodesByType('ArrayExpression'));

    nodes.forEach(el => {
        if (~wasRemoved.indexOf(el)) { return; }
        var parentEl = el.parentElement;
        if (parentEl.type === 'ExpressionStatement') {
            parentEl = parentEl.parentElement;
        }
        if (parentEl.type !== 'Program') { return; }

        // Actual rule
        var statement = el.parentElement;
        var root = statement.parentElement;
        var exp = el;

        switch (el.type) {
            case 'AssignmentExpression':
                exp = el.right;
                switch (format) {
                    case 'expression':
                        if (lint) {
                            assertExpressionFormat(errors, el);
                        } else {
                            if (exp.type === 'ObjectExpression') {
                                    root.replaceChild(wrapElementInParentheses(exp), statement);
                            } else if (exp.type === 'ArrayExpression') {
                                if (exp.elements.length === 1) {
                                    root.replaceChild(wrapElementInParentheses(exp.elements[0]), statement);
                                } else {
                                    statement.replaceChild(exp.cloneElement(), el);
                                }
                            } else {
                                statement.replaceChild($.createArray([exp.cloneElement()]), el);
                            }
                        }
                        break;
                    case 'objectexpression':
                        if (lint) {
                            assertArrayExpressionFormat(errors, el);
                        } else {
                            statement.replaceChild(exp.cloneElement(), el);
                            root.replaceChild(wrapElementInParentheses(exp), statement);
                        }
                        break;
                    case 'arrayexpression':
                        if (lint) {
                            assertArrayExpressionFormat(errors, el);
                        } else {
                            if (exp.type === 'ArrayExpression') {
                                statement.replaceChild(exp.cloneElement(), el);
                            } else {
                                statement.replaceChild($.createArray([exp.cloneElement()]), el);
                            }
                        }
                        break;
                }
                break;
            case 'ObjectExpression':
                switch (format) {
                    case 'arrayexpression':
                        lint ?
                            assertArrayExpressionFormat(errors, el) :
                            root.replaceChild(
                                wrapInExpressionStatement($.createArray([exp.cloneElement()])),
                                statement);
                        break;
                    case 'commonjs':
                        lint ?
                            assertCommonJSFormat(errors, el) :
                            root.replaceChild(
                                wrapInExpressionStatement(createAsignment(exp)),
                                statement);
                        break;
                }
                break;
            case 'ArrayExpression':
                switch (format) {
                    case 'arrayexpression':
                        lint ?
                            assertArrayExpressionFormatInParentheses(errors, statement) :
                            root.replaceChild(
                                wrapInExpressionStatement(exp.cloneElement()),
                                statement);
                        break;
                    case 'expression':
                        if (exp.elements.length === 1) {
                            if (lint) {
                                assertExpressionFormatAsObj(errors, el);
                            } else {
                                root.replaceChild(wrapElementInParentheses(exp.elements[0]), statement);
                            }
                        } else {
                            if (lint) {
                                assertExpressionFormatAsArr(errors, statement);
                            } else {
                                root.replaceChild(
                                    wrapInExpressionStatement(exp.cloneElement()),
                                    statement);
                            }
                        }
                        break;
                    case 'objectexpression':
                        if (lint) {
                            assertObjectExpressionFormat(errors, el);
                        } else {
                            statement.replaceChild(exp.cloneElement(), el);
                            root.replaceChild(wrapElementInParentheses(exp), statement);
                        }
                        break;
                    case 'commonjs':
                        lint ?
                            assertCommonJSFormat(errors, el) :
                        root.replaceChild(
                            wrapInExpressionStatement(createAsignment(exp)),
                            statement);
                        break;
                }
                break;
        }
    });
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

function wrapInExpressionStatement(exp) {
    return new types.ExpressionStatement([
        exp.cloneElement(),
        new Token('Punctuator', ';')
    ]);
}

function assertArrayExpressionFormat(errors, exp) {
    var error = new Warnie('Expected format: ArrayExpression but get ' + exp.type);
    var loc = exp.firstChild.getLoc().start;
    error.line = loc.line;
    error.column = loc.column;
    errors.push(error);
}

function assertArrayExpressionFormatInParentheses(errors, exp) {
    if (exp.firstChild.value === '(') {
        var error = new Warnie('Expected format: arrayExpression' +
            ' but get ([{..., use just [{... where it is possible');
        var loc = exp.firstChild.getLoc().start;
        error.line = loc.line;
        error.column = loc.column;
        errors.push(error);
    }
}

function assertObjectExpressionFormat(errors, exp) {
    var error = new Warnie('Expected format: ObjectExpression but get ' + exp.type);
    var loc = exp.firstChild.getLoc().start;
    error.line = loc.line;
    error.column = loc.column;
    errors.push(error);
}

function assertCommonJSFormat(errors, exp) {
    var error = new Warnie('Expected format: commonJS but get ' + exp.type);
    var loc = exp.firstChild.getLoc().start;
    error.line = loc.line;
    error.column = loc.column;
    errors.push(error);
}

function assertExpressionFormat(errors, exp) {
    var error = new Warnie('Expected format: expression but get ' + exp.type);
    var loc = exp.getLoc().start;
    error.line = loc.line;
    error.column = loc.column;
    errors.push(error);
}

function assertExpressionFormatAsObj(errors, exp) {
    var error = new Warnie('Expected format: expression' +
        ' but get ArrayExpression, use ObjectExpression where it is possible');
    var loc = exp.getLoc().start;
    error.line = loc.line;
    error.column = loc.column;
    errors.push(error);
}

function assertExpressionFormatAsArr(errors, exp) {
    if (exp.firstChild.value === '(') {
        var error = new Warnie('Expected format: expression' +
            ' but get ([{..., use just [{... where it is possible');
        var loc = exp.firstChild.getLoc().start;
        error.line = loc.line;
        error.column = loc.column;
        errors.push(error);
    }
}


// TODO: move to cst-helpers
function createAsignment(exp) {
    return new types.AssignmentExpression([
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
        exp.cloneElement()
    ]);
}
