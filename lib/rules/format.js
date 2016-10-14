var through = require('through2');

var Token = require('cst').Token;
var types = require('cst').types;

var $ = require('cst-helpers');

module.exports = (format) => through.obj(function(file, _, next) {
    var tree = file.tree;

    switch (format) {
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
        default:
            console.error(file.path);
            console.error('unknown deps format');
            break;
    }

    file.contents = new Buffer(tree.getSourceCode());

    next(null, file);
});

/**
 * @returns {Array.<?ObjectExpression>}
 */
function findBemDepsObjects(tree) {
    var props = tree.selectNodesByType('ObjectProperty')
                    .filter(op => op.key.name === 'shouldDeps' ||
                            op.key.name === 'mustDeps' ||
                            op.key.name === 'noDeps');

    return  props.reduce((prev, cur, i) => {
        if (!i || cur.parentElement !== prev[i - 1]) {
            prev.push(cur.parentElement)
        }
        return prev;
    }, []);
}

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
