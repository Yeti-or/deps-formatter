
var coa = require('coa');
var pkg = require('./package.json');

var formatter = require('.');

module.exports = coa.Cmd()
    .helpful()
    .name(pkg.name)
    .title(pkg.description)
    .opt()
        .name('version').title('Version')
        .short('V').long('version')
        .only()
        .flag()
        .act(function() {
            // output the version to stdout instead of stderr if returned
            process.stdout.write(pkg.version + '\n');
            // coa will run `.toString` on the returned value and send it to stderr
            return '';
        })
        .end()

    .opt()
        .name('reporter').title('Use specific reporter https://github.com/Yeti-or/deps-formatter#reporters')
        .short('r').long('reporter')
        .def('console')
        .end()

    .opt()
        .name('lint').title('Lint only don\'t fix')
        .short('l').long('lint')
        .flag()
        .def(false)
        .end()
    .arg()
        .arr()
        .name('files').title('any-file.deps.js another.deps.js')
        .end()
    .act(function(opts, args) {
        formatter(opts)(args.files);
    });
