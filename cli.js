
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
        .act(() => {
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
    .act((opts, args) => formatter(args.targets));
