var Token = require('cst').Token;

/**
 * @returns {Array.<?ObjectExpression>}
 */
function findBemDepsObjects(tree) {
    return findBemDepsProps(tree)
        .reduce((prev, cur, i) => {
            if (!i || cur.parentElement !== prev[i - 1]) {
                prev.push(cur.parentElement);
            }
            return prev;
        }, []);
}

/**
 * @returns {Array.<?ObjectProperty>}
 */
function findBemDepsProps(tree) {
    return tree.selectNodesByType('ObjectProperty')
                .filter(op => op.key.name === 'shouldDeps' ||
                        op.key.name === 'mustDeps' ||
                        op.key.name === 'noDeps');
}

function getBasicIndetion(/*element*/) {
    // TODO
    return '    ';
}

function updateIndention(/*element*/) {
}

function insertWhitespaceBeforeEl(el, indention, noCaret) {
    if (!el) { return; }
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

function beautyfyElement(element, indention, level) {
    if (!element) { return; }
    indention || (indention = '');
    level || (level = 0);

    var subIndention = indention + getBasicIndetion(element);
    var tenorok = null;

    if (element.type === 'ArrayExpression') {
        var array = element;

        if (isMultiline(array) || level === 0 || level === 2) {
            for (var i = 0; i < array.elements.length; i++) {
                tenorok = array.elements[i];
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
        tenorok = element;

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
        console.log();
    } else {
        console.log('WTF');
        console.log(element.type);
        console.log(element.getSourceCode());
    }
}

module.exports = {
    findBemDepsObjects,
    findBemDepsProps,
    getBasicIndetion,
    beautyfyElement,
    updateIndention
};
