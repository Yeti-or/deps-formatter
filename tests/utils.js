var chai = require('chai');
var expect = chai.expect;

var cst = require('cst');

var parser = new cst.Parser();

var assertRule = function(rule, from, to, comment) {
    var tree = parser.parse(from);
    rule(tree);
    expect(tree.getSourceCode(), comment ? comment : null ).to.eql(to);
};

var assertRules = function(rules, from, to, comment) {
    var tree = parser.parse(from);
    rules.forEach(rule => rule(tree));
    expect(tree.getSourceCode(), comment ? comment : null ).to.eql(to);
};

module.exports = {
    assertRule,
    assertRules
};
