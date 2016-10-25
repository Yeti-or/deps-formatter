
var assertRule = require('./utils.js').assertRule;

var rule = require('../lib/rules/depsObjIsArray.js').rule;

describe('depsObjIsArray rule', () => {

    describe('value: false', () => {
        it('{}', () => {
            var depFile =
            `
            ({
                mustDeps: {block: 'i-bem'}
            });`;

            var transformedDepFile =
            `
            ({
                mustDeps: {block: 'i-bem'}
            });`;

            assertRule(rule({depsObjIsArray: false}), depFile, transformedDepFile);
        });

        it('[{}]', () => {
            var depFile =
            `
            ({
                mustDeps: [{block: 'i-bem'}]
            });`;

            var transformedDepFile =
            `
            ({
                mustDeps: {block: 'i-bem'}
            });`;

            assertRule(rule({depsObjIsArray: false}), depFile, transformedDepFile);
        });

        it('[{}, {}]', () => {
            var depFile =
            `
            ({
                mustDeps: [
                    {block: 'i-bem'},
                    'i-ua'
                ]
            });`;

            var transformedDepFile =
            `
            ({
                mustDeps: [
                    {block: 'i-bem'},
                    'i-ua'
                ]
            });`;

            assertRule(rule({depsObjIsArray: false}), depFile, transformedDepFile);
        });
    });

    describe('value: true', () => {
        it('{}', () => {
            var depFile =
            `
            ({
                mustDeps: {block: 'i-bem'}
            });`;

            var transformedDepFile =
            `
            ({
                mustDeps: [{block: 'i-bem'}]
            });`;

            assertRule(rule({depsObjIsArray: true}), depFile, transformedDepFile);
        });

        it('[{}]', () => {
            var depFile =
            `
            ({
                mustDeps: [{block: 'i-bem'}]
            });`;

            var transformedDepFile =
            `
            ({
                mustDeps: [{block: 'i-bem'}]
            });`;

            assertRule(rule({depsObjIsArray: true}), depFile, transformedDepFile);
        });

        it('[{}, {}]', () => {
            var depFile =
            `
            ({
                mustDeps: [
                    {block: 'i-bem'},
                    'i-ua'
                ]
            });`;

            var transformedDepFile =
            `
            ({
                mustDeps: [
                    {block: 'i-bem'},
                    'i-ua'
                ]
            });`;

            assertRule(rule({depsObjIsArray: true}), depFile, transformedDepFile);
        });
    });

});
