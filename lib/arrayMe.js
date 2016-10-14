var through = require('through2');
var Token = require('cst').Token;
var types = require('cst').types;
var Property = types.ObjectProperty;
var Identifier = types.Identifier;

module.exports = function() {
    return through.obj(function(file, _, next) {

        if (!!~file.path.indexOf('debug-block')) {
            debugger;
        }

        var tree = file.tree;

        wrapDep(tree);
        wrapDepsWithArray(tree);
        beautyfy(tree);

        file.contents = new Buffer(tree.getSourceCode());

        next(null, file);
    });
};

module.exports.wrapDep = wrapDep;
module.exports.wrapDepsWithArray = wrapDepsWithArray;
module.exports.beautyfy = beautyfy;

function wrapStringDepToObjectExpression(literal) {
    return new types.ObjectExpression([
        new Token('Punctuator', '{'),
        new Property([
            new Identifier([new Token('Identifier', 'block')]),
            new Token('Punctuator', ':'),
            new Token('Whitespace', ' '),
            literal.cloneElement(),
        ]),
        new Token('Punctuator', '}')
    ]);
}

function wrapDep(tree) {

tree.selectNodesByType('Identifier').forEach((dep) => {
    if (dep.name === 'mustDeps' || dep.name === 'shouldDeps') {
        var prop = dep.parentElement;

        if (prop.value.type === 'ArrayExpression') {
            prop.value.elements.forEach((tenorok) => {
                if (tenorok && tenorok.type === 'StringLiteral') {
                    prop.value.replaceChild(wrapStringDepToObjectExpression(tenorok), tenorok);
                }
            });
        }
        if (prop.value.type === 'StringLiteral') {
            prop.replaceChild(wrapStringDepToObjectExpression(prop.value), prop.value);
        }
        if (prop.value.type === 'ObjectExpression') {
            prop.replaceChild(wrapObjectExpressionIntoArray(prop.value), prop.value);
        }
    }
});

}

function beautyfy(tree) {
    var root = tree.body[0];
    root && root.expression && beautyfyElement(root.expression);
}

function insertWhitespaceBeforeEl(el, indention, noCaret) {
    if (!el) return;
    var whiteSpace = new Token('Whitespace', (noCaret ? '' : '\n') + indention);
    var maybeWhitespace = el.previousSibling;

    if (maybeWhitespace && maybeWhitespace.type === 'Whitespace') {
        maybeWhitespace.parentElement.replaceChild(whiteSpace, maybeWhitespace);
    } else {
        el.parentElement.insertChildBefore(whiteSpace, el);
    }
}

function isMultiline(element) {
    var loc = element.getLoc();
    if (loc.start.line !== loc.end.line) {
        return true;
    }
    return false;
}

var defaultIndention = '    ';

function beautyfyElement(element, indention, level) {
    if (!element) return;
    indention || (indention = '');
    level || (level = 0);

    var subIndention = indention + defaultIndention;

    if (element.type === 'ArrayExpression') {
        var array = element;

        if (isMultiline(array) || level === 0 || level === 2) {
            for (var i = 0; i < array.elements.length; i++) {
                var tenorok = array.elements[i];
                if (!level) {
                    if (i === 0) {
                        insertWhitespaceBeforeEl(tenorok, indention, true);
                    } else {
                        insertWhitespaceBeforeEl(tenorok, ' ', true);
                    }
                    beautyfyElement(tenorok, indention, level + 1);
                } else {
                    insertWhitespaceBeforeEl(tenorok, subIndention);
                    beautyfyElement(tenorok, subIndention, level + 1);
                }
            }
            // indention for closing bracket
            if (level) {
                insertWhitespaceBeforeEl(array.lastChild, indention);
            } else {
                insertWhitespaceBeforeEl(array.lastChild, indention, true);
            }
        }

    } else if (element.type === 'ObjectExpression') {
        var tenorok = element;

        if (isMultiline(tenorok) || level === 1) {
            // is Multiline
            var lastChild = tenorok.lastChild;

            tenorok.properties.forEach(property => {
                beautyfyElement(property, indention, level + 1);
            });
            // TODO: comments

            insertWhitespaceBeforeEl(lastChild, indention);
        }
    } else if (element.type === 'ObjectProperty') {
        var property = element;

        insertWhitespaceBeforeEl(property, subIndention);
        beautyfyElement(property.value, subIndention, level++);
    } else if (element.type === 'CommentLine') {
        insertWhitespaceBeforeEl(element, subIndention);
    } else if (element.type === 'StringLiteral') {
        // do nothing
    } else {
        console.log('WTF');
        console.log(element.type);
        console.log(element.getSourceCode());
        debugger;
    }
}

function wrapObjectExpressionIntoArray(exp) {
    return new types.ArrayExpression([
        new Token('Punctuator', '['),
        exp.cloneElement(),
        new Token('Punctuator', ']')
    ]);
}

function wrapDepsWithArray(tree) {
    var root = tree.body[0];
    var exp = root && root.expression;
    if (!exp) return;
    var statement = exp.parentElement;

    var our = null;

    if (exp.type === 'ObjectExpression') {
        our = wrapObjectExpressionIntoArray(exp);
        statement.replaceChild(our, exp);
    }

    if (exp.type === 'ArrayExpression') {
        our = new types.ExpressionStatement([
            new Token('Punctuator', '('),
            exp.cloneElement(),
            new Token('Punctuator', ')'),
            new Token('Punctuator', ';')
        ]);
        statement.parentElement.replaceChild(our, statement);
    }

}
