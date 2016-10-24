
var assertRule = require('./utils.js').assertRule;

var blockNameShortcut = require('../lib/rules/blockNameShortcut.js').rule;

describe('blockNameShortcut rule', () => {
    it('should create shortCut where possible', () => {
        var depFile =
        `({
            mustDeps: {block: 'i-bem'}
        });`;

        var transformedDepFile =
        `({
            mustDeps: 'i-bem'
        });`;

        assertRule(blockNameShortcut, {blockNameShortcut: true}, depFile, transformedDepFile);
        assertRule(blockNameShortcut, {blockNameShortcut: false}, transformedDepFile, depFile);
    });

    it('should work woth mustDeps|shouldDeps|noDeps', () => {
        var depFile =
        `({
            mustDeps: {block: 'i-bem'},
            shouldDeps: {block: 'i-ua'},
            noDeps: {block: 'i-global'}
        });`;

        var transformedDepFile =
        `({
            mustDeps: 'i-bem',
            shouldDeps: 'i-ua',
            noDeps: 'i-global'
        });`;

        assertRule(blockNameShortcut, {blockNameShortcut: true}, depFile, transformedDepFile);
        assertRule(blockNameShortcut, {blockNameShortcut: false}, transformedDepFile, depFile);
    });

    it('should work with arrays', () => {
        var depFile =
        `({
            mustDeps: [
                {block: 'i-bem'},
                {block: 'i-ua'},
                {elem: 'array'},
                {block: 'i-global'}
            ]
        });`;

        var transformedDepFile =
        `({
            mustDeps: [
                'i-bem',
                'i-ua',
                {elem: 'array'},
                'i-global'
            ]
        });`;

        assertRule(blockNameShortcut, {blockNameShortcut: true}, depFile, transformedDepFile);
        assertRule(blockNameShortcut, {blockNameShortcut: false}, transformedDepFile, depFile);
    });

    it('should ignore blocks with elems/mods', () => {
        var depFile =
        `({
            mustDeps: [
                {block: 'i-ecma', elem: 'array'}
            ]
        });`;

        var transformedDepFile =
        `({
            mustDeps: [
                {block: 'i-ecma', elem: 'array'}
            ]
        });`;

        assertRule(blockNameShortcut, {blockNameShortcut: true}, depFile, transformedDepFile);
        assertRule(blockNameShortcut, {blockNameShortcut: false}, transformedDepFile, depFile);
    });
});
