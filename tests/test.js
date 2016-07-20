var chai = require('chai');
var expect = chai.expect;

var cst = require('cst');

var parser = new cst.Parser();

var formatter = require('..');

var processDep = function(from, to) {
    var tree = parser.parse(from);
    formatter(tree);
    expect(tree.getSourceCode()).to.eql(to);
};

