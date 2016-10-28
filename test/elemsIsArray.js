
var assertRule = require('./utils.js').assertRule;

var rule = require('../lib/rules/elemsIsArray.js').rule;

describe('elemsIsArray rule', () => {

    describe('elems', () => {

        describe('value: true', () => {
            it('str', () => {
                var depFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: 'html'}
                });`;

                var transformedDepFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: ['html']}
                });`;

                assertRule(rule({elemsIsArray: true}), depFile, transformedDepFile);
            });

            it('{}', () => {
                var depFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: {elem: 'html'}}
                });`;

                var transformedDepFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: [{elem: 'html'}]}
                });`;

                assertRule(rule({elemsIsArray: true}), depFile, transformedDepFile);
            });

            it('[str]', () => {
                var depFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: ['html']}
                });`;

                var transformedDepFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: ['html']}
                });`;

                assertRule(rule({elemsIsArray: true}), depFile, transformedDepFile);
            });

            it('[{}]', () => {
                var depFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: [{elem: 'html'}]}
                });`;

                var transformedDepFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: [{elem: 'html'}]}
                });`;

                assertRule(rule({elemsIsArray: true}), depFile, transformedDepFile);
            });

            it('[{}, {}]', () => {
                var depFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: [{elem: 'html'}, {elem: 'dom'}]}
                });`;

                var transformedDepFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: [{elem: 'html'}, {elem: 'dom'}]}
                });`;

                assertRule(rule({elemsIsArray: true}), depFile, transformedDepFile);
            });

        });

        describe('value: false', () => {

            it('str', () => {
                var depFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: 'html'}
                });`;

                var transformedDepFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: 'html'}
                });`;

                assertRule(rule({elemsIsArray: false}), depFile, transformedDepFile);
            });

            it('{}', () => {
                var depFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: {elem: 'html'}}
                });`;

                var transformedDepFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: {elem: 'html'}}
                });`;

                assertRule(rule({elemsIsArray: false}), depFile, transformedDepFile);
            });

            it('[str]', () => {
                var depFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: ['html']}
                });`;

                var transformedDepFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: 'html'}
                });`;

                assertRule(rule({elemsIsArray: false}), depFile, transformedDepFile);
            });

            it('[{}]', () => {
                var depFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: [{elem: 'html'}]}
                });`;

                var transformedDepFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: {elem: 'html'}}
                });`;

                assertRule(rule({elemsIsArray: false}), depFile, transformedDepFile);
            });

            it('[{}, {}]', () => {
                var depFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: [{elem: 'html'}, {elem: 'dom'}]}
                });`;

                var transformedDepFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elems: [{elem: 'html'}, {elem: 'dom'}]}
                });`;

                assertRule(rule({elemsIsArray: false}), depFile, transformedDepFile);
            });

        });

    });

    describe('elem', () => {

        describe('value: true', () => {

            it('str', () => {
                var depFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elem: 'html'}
                });`;

                var transformedDepFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elem: ['html']}
                });`;

                assertRule(rule({elemsIsArray: true}), depFile, transformedDepFile);
            });

            it('[str]', () => {
                var depFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elem: ['html']}
                });`;

                var transformedDepFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elem: ['html']}
                });`;

                assertRule(rule({elemsIsArray: true}), depFile, transformedDepFile);
            });

        });

        describe('value: false', () => {

            it('str', () => {
                var depFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elem: 'html'}
                });`;

                var transformedDepFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elem: 'html'}
                });`;

                assertRule(rule({elemsIsArray: false}), depFile, transformedDepFile);
            });

            it('[str]', () => {
                var depFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elem: ['html']}
                });`;

                var transformedDepFile =
                `
                ({
                    mustDeps: {block: 'i-bem', elem: 'html'}
                });`;

                assertRule(rule({elemsIsArray: false}), depFile, transformedDepFile);
            });

        });
    });

});
