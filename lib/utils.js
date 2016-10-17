
/**
 * @returns {Array.<?ObjectExpression>}
 */
function findBemDepsObjects(tree) {
    return findBemDepsProps(tree)
        .reduce((prev, cur, i) => {
            if (!i || cur.parentElement !== prev[i - 1]) {
                prev.push(cur.parentElement)
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

module.exports = {
    findBemDepsObjects: findBemDepsObjects,
    findBemDepsProps: findBemDepsProps
};
