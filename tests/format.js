
var assertRule = require('./utils.js').assertRule;
var assertRules = require('./utils.js').assertRules;

var formatRule = require('../lib/rules/format.js').rule;

describe('format rule', () => {
    describe('commonJS', () => {
        it('one', () => {
            var depFile =
            `({
                mustDeps: {block: 'i-bem'}
            });`;

            var transformedDepFile =
            `module.exports = {
                mustDeps: {block: 'i-bem'}
            };`;

            assertRule(formatRule({format: 'commonjs'}), depFile, transformedDepFile);
        });

        it('many', () => {
            var depFile =
            `([{
                mustDeps: {block: 'i-bem'}
            }, {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }]);`;

            var transformedDepFile =
            `module.exports = [{
                mustDeps: {block: 'i-bem'}
            }, {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }];`;

            assertRule(formatRule({format: 'commonjs'}), depFile, transformedDepFile);
        });

        xit('many with format', () => {
            var depFile =
            `([{
                mustDeps: {block: 'i-bem'}
            },
            {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }]);`;

            var transformedDepFile =
            `module.exports = [{
                mustDeps: {block: 'i-bem'}
            },
            {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }];`;

            assertRule(formatRule({format: 'commonjs'}), depFile, transformedDepFile);
        });

    });

    describe('expression', () => {
        it('one', () => {
            var depFile =
            `({
                mustDeps: {block: 'i-bem'}
            });`;

            var transformedDepFile =
            `({
                mustDeps: {block: 'i-bem'}
            });`;

            assertRule(formatRule({format: 'expression'}), depFile, transformedDepFile);
        });

        it('many', () => {
            var depFile =
            `([{
                mustDeps: {block: 'i-bem'}
            }, {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }]);`;

            var transformedDepFile =
            `[{
                mustDeps: {block: 'i-bem'}
            }, {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }];`;

            assertRule(formatRule({format: 'expression'}), depFile, transformedDepFile);
        });
    });

    describe('arrayExpression', () => {
        it('one', () => {
            var depFile =
            `({
                mustDeps: {block: 'i-bem'}
            });`;

            var transformedDepFile =
            `[{
                mustDeps: {block: 'i-bem'}
            }];`;

            assertRule(formatRule({format: 'arrayExpression'}), depFile, transformedDepFile);
        });

        it('many', () => {
            var depFile =
            `([{
                mustDeps: {block: 'i-bem'}
            }, {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }]);`;

            var transformedDepFile =
            `[{
                mustDeps: {block: 'i-bem'}
            }, {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }];`;

            assertRule(formatRule({format: 'arrayExpression'}), depFile, transformedDepFile);
        });
    });

    describe('objectExpression', () => {
        it('one', () => {
            var depFile =
            `({
                mustDeps: {block: 'i-bem'}
            });`;

            var transformedDepFile =
            `({
                mustDeps: {block: 'i-bem'}
            });`;

            assertRule(formatRule({format: 'objectExpression'}), depFile, transformedDepFile);
        });

        it('many', () => {
            var depFile =
            `([{
                mustDeps: {block: 'i-bem'}
            }, {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }]);`;

            var transformedDepFile =
            `([{
                mustDeps: {block: 'i-bem'}
            }, {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }]);`;

            assertRule(formatRule({format: 'objectExpression'}), depFile, transformedDepFile);
        });
    });

    describe('all', () => {
        it('one', () => {
            var depFile =
            `({
                mustDeps: {block: 'i-bem'}
            });`;

            var rules = [
                formatRule({format: 'commonJS'}),
                formatRule({format: 'arrayExpression'}),
                formatRule({format: 'expression'}),
                formatRule({format: 'objectExpression'}),

                formatRule({format: 'arrayExpression'}),
                formatRule({format: 'expression'}),
                formatRule({format: 'objectExpression'}),
                formatRule({format: 'commonJS'}),

                formatRule({format: 'expression'}),
                formatRule({format: 'objectExpression'}),
                formatRule({format: 'commonJS'}),
                formatRule({format: 'arrayExpression'}),

                formatRule({format: 'objectExpression'}),
                formatRule({format: 'commonJS'}),
                formatRule({format: 'arrayExpression'}),
                formatRule({format: 'expression'}),

                formatRule({format: 'commonJS'}),
                formatRule({format: 'arrayExpression'}),
                formatRule({format: 'expression'}),
                formatRule({format: 'objectExpression'}),
            ];
            assertRules(rules, depFile, depFile);
        });

        it('many', () => {
            var depFile =
            `([{
                mustDeps: {block: 'i-bem'}
            }, {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }]);`;

            var transformedDepFile =
            `([{
                mustDeps: {block: 'i-bem'}
            }, {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }]);`;

            var rules = [
                formatRule({format: 'commonJS'}),
                formatRule({format: 'arrayExpression'}),
                formatRule({format: 'expression'}),
                formatRule({format: 'objectExpression'}),

                formatRule({format: 'arrayExpression'}),
                formatRule({format: 'expression'}),
                formatRule({format: 'objectExpression'}),
                formatRule({format: 'commonJS'}),

                formatRule({format: 'expression'}),
                formatRule({format: 'objectExpression'}),
                formatRule({format: 'commonJS'}),
                formatRule({format: 'arrayExpression'}),

                formatRule({format: 'objectExpression'}),
                formatRule({format: 'commonJS'}),
                formatRule({format: 'arrayExpression'}),
                formatRule({format: 'expression'}),

                formatRule({format: 'commonJS'}),
                formatRule({format: 'arrayExpression'}),
                formatRule({format: 'expression'}),
                formatRule({format: 'objectExpression'}),
            ];
            assertRules(rules, depFile, depFile);
        });
    });
    xdescribe('with comment', () => {
        it('commonJS', () => {
            var depFile =
            `([{
                mustDeps: {block: 'i-bem'}
            },
            // Fuck
            {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }]);`;

            var transformedDepFile =
            `module.exports = [{
                mustDeps: {block: 'i-bem'}
            },
            // Fuck
            {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }];`;

            assertRule(formatRule({format: 'commonJS'}), depFile, transformedDepFile);
        });

        it('expression', () => {
            var depFile =
            `([{
                mustDeps: {block: 'i-bem'}
            },
            // Fuck
            {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }]);`;

            var transformedDepFile =
            `[{
                mustDeps: {block: 'i-bem'}
            },
            // Fuck
            {
                tech: js,
                mustDeps: {block: 'i-jquery'}
            }];`;

            assertRule(formatRule({format: 'expression'}), depFile, transformedDepFile);
        });
    });
});
