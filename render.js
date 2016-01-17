'use strict';
/**
 * Node js script to render and download svg cubes using webdriver
 */

var webdriverio = require('webdriverio');
var path = require('path');
var globby = require('globby');
var gm = require('gm');

var SvgCube = require('./SvgCube.js');
// var $ = require('jquery');

var chromedriver = require('chromedriver');
var childProcess = require('child_process');

// get inputs
if (process.argv.length < 3 || process.argv.length > 4) {
    console.log('Command: ', process.argv);
    console.log('Usage: node rasterize.js svgCube.html panel.svg');
    return;
} else {
    var input = process.argv[2];
    var outfile = process.argv[3];
    console.log('input:', input);
}

// see if we are in debug mode
var debug = process.env.DEBUG || false;

// start server chromedriver for selenium
var binPath = chromedriver.path;
var childArgs = ['--url-base=/wd/hub', '--whitelisted-ips="*"'];
if (debug){childArgs.push('--verbose');}

var chromeInstance = childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
    if (err) {
        console.error('[webdriver]', err, stdout, stderr);
    } else {
        console.log('[webdriver]', stdout, stderr);
    }
});

// define client
var options = {
    host: "localhost",
    port: 9515,
    desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
            binary: '/usr/bin/chromium'
        }
    }
};
var client = webdriverio.remote(options);


var bounds;

// get input file and components
var file = input;
var address = path.join(process.cwd(), file);
var ext = path.extname(file);
var url = 'file://' + path.join(process.cwd(), file);
var outfile = outfile? outfile:address.replace(ext, '.png');

console.info('Converting ', file, url, '->', outfile);

// start client
client.init()
    .url(url)
    // inject code into page
    .execute(function () {
        var cube1, text;
        cube1 = new SvgCube.SvgCube({
            rotateX: 45,
            svgPanel: 'inputs/panels.svg',
            clipCircle: false,
            stroke: {
                'stroke': 'black', // stroke color for outline
                'stroke-width': 0, // outline width
            },
            size: 444,
        });
        text = cube1.getBounds();

        // Get dimensions of each pane and make it accesable to webdriver
        $('#dimensions').attr('value', 1);
        $('#dimensions').text(JSON.stringify(text));
    })
    .waitForVisible('.front', 5000)
    // get image boundries from html
    .execute(function () {
        return $('#dimensions').text();
    })
    .then(text => {
        console.info('[svg2Cube] dimensions', text);
        try {
            bounds = JSON.parse(text.value);
        } catch (e) {
            console.warn(text);
        }
    })
    // take a screen shot crop using graphics magic
    .screenshot()
    .then(res => {
        var imgBuffer = new Buffer(res.value, 'base64');

        /** Crop it using graphicks magic */
        gm(imgBuffer)
            .crop(
                bounds.right.max - bounds.left.min,
                bounds.bottom.max - bounds.top.min,
                bounds.left.min,
                bounds.top.min
            )
            .write(outfile, function (err) {
                if (!err) {console.log('done');}
            });

    })
    .end()
    .then(function(){
        // close the browser server
        if (chromeInstance !== null){
            chromeInstance.kill();
        }
    });
