'use strict';
/**
 * Node js script to render and download svg cubes using webdriver
 */

var webdriverio = require('webdriverio');
var path = require('path');
var gm = require('gm');

var chromedriver = require('chromedriver');
var childProcess = require('child_process');

var SvgCube = require('./svg2cube.js');


var debug = process.env.DEBUG || false;
const converterFileName = 'file://'+path.resolve(__dirname, "./svgCube.html");
console.log(converterFileName);
const binPath = chromedriver.path;
var childArgs = ['--url-base=/wd/hub', '--whitelisted-ips="*"'];
if (debug) {
    childArgs.push('--verbose');
}

/**
 * Convert an svg panel with 6 sides into a image of the folded cube. The out
 * images are png.
 * @param  {string} svgPanel file name of svgpanel
 * @param  {string} outfile  output filename
 * @param  {object} options  See svgCube.js for full options
 * @return {undefined}
 */
module.exports = function (svgPanel, outfile, options) {

    // start server chromedriver for selenium
    var chromeInstance = childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
        if (err) {
            console.error('[webdriver]', err, stdout, stderr);
        } else {
            console.log('[webdriver]', stdout, stderr);
        }
    });

    // define client
    var webdriverOptions = {
        host: "localhost",
        port: 9515,
        desiredCapabilities: {
            browserName: 'phantonjs',
        }
    };
    var client = webdriverio.remote(webdriverOptions);

    var bounds;

    // get input file and components
    var address = path.join(process.cwd(), svgPanel);
    var ext = path.extname(svgPanel);
    outfile = outfile ? outfile : address.replace(ext, '.png');
    svgPanel = 'file://'+path.resolve(__dirname,svgPanel);
    console.info('Converting ', svgPanel, '->', outfile);

    options = options ? options: {};


    // start client
    client.init()
        .windowHandleMaximize()
        .getViewportSize()
        .then(function(size) {
            // set a reasonable size based on viewport size
             var minSize = Math.min(size.width, size.height)/2;
             if (!options.size){
                 options.size = minSize;
             } else if (options.size && options.size > minSize){
                 console.warn('Pane size '+options.size+' to big for viewport '+size+', setting to '+minSize);
                 options.size = minSize;
             }
         })
        .url(converterFileName)
        // inject code into page
        .execute(function (svgPanel,options) {
            var cube1 = new SvgCube.SvgCube(svgPanel, options);
            return cube1.getBounds();
        },svgPanel,options)
        .then(text => {
            // rendered dimensions are returned
            console.info('[svg2Cube] dimensions', text);
            bounds = text.value;
        })
        // take a screen shot crop using graphics magic
        .screenshot()
        .then(res => {
            var imgBuffer = new Buffer(res.value, 'base64');

            /** Crop it using GraphicsMagick */
            gm(imgBuffer)
                .crop(
                    bounds.right.max - bounds.left.min,
                    bounds.bottom.max - bounds.top.min,
                    bounds.left.min,
                    bounds.top.min
                )
                .write(outfile, function (err) {
                    if (!err) {
                        console.log('done');
                    }
                });

        })
        .end()
        .then(function () {
            // close the browser server
            if (chromeInstance !== null) {
                chromeInstance.kill();
            }
        });
};


// get inputs
if (process.argv.length < 3 || process.argv.length > 4) {
    console.log('Command: ', process.argv);
    console.log('Usage: node rasterize.js panel.svg');
    return;
} else {
    var input = process.argv[2];
    var outfile = process.argv[3];
    console.log('input:', input, 'output:', outfile);
}
module.exports(input,outfile);
