var through = require('through2');

function escapeAttrValue(attrValue) {
    return String(attrValue)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

module.exports = function() {
    console.log('<?xml version="1.0" encoding="utf-8"?>\n<checkstyle version="4.3">');
    return through.obj(function(file, enc, next) {
        console.log('    <file name="' + escapeAttrValue(file.path) + '">');

        file.errors.forEach(error => {
            console.log(
                '        <error ' +
                'line="' + error.line + '" ' +
                'column="' + (error.column + 1) + '" ' +
                'severity="error" ' +
                'message="' + escapeAttrValue(error.message) + '" ' +
                'source="deps-formatter" />'
            );
        });

        console.log('    </file>');
        next(null, file);
    })
    .on('end', () => {
        console.log('</checkstyle>');
    });
};
