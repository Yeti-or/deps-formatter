var fs = require('fs');

function initConfig() {
    var config = {
        'rules': {
            'format': 'arrayexpression',
            'depsObjIsArray': true,
            'elemsIsArray': true,
            'blockNameShortcut': false
        },
        'levels': {
            'common.blocks': {},
            'desktop.blocks': {}
        }
    };

    fs.writeFile('.deps-formatterrc', JSON.stringify(config, null, 4), err => {
        if (err) { throw err; }
        console.log('Config inited!');
    });
}

module.exports = {
    initConfig
};
