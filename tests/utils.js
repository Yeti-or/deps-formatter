var chai = require('chai');
var expect = chai.expect;

var cst = require('cst');

var parser = new cst.Parser();

var assertRule = function(rule, opts, from, to) {
    var tree = parser.parse(from);
    rule(tree, opts);
    expect(tree.getSourceCode()).to.eql(to);
};

module.exports = {assertRule: assertRule};
