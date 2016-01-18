/** command line interface for svg2cube. Usage `node svg2cube panel.svg` **/
var svg2cube = require('./svg2cube.js');

if (process.argv.length < 3 || process.argv.length > 4) {
    console.log('Command: ', process.argv);
    console.log('Usage: node rasterize.js panel.svg');
    return;
} else {
    var input = process.argv[2];
    var outfile = process.argv[3];
    console.log('input:', input, 'output:', outfile);
}
svg2cube(input,outfile);
