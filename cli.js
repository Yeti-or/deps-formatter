
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

    .arg()
        .arr()
        .name('targets')
        .end()
    .act(function(opts, args) {
        formatter(args.targets);
    });
