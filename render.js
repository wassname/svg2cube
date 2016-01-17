'use strict';
/**
 * Node js script to render and download svg cubes using webdriver
 */

var webdriverio = require('webdriverio');
var path = require('path');
// var fs = require('fs');
// var system = require('system')
var globby = require('globby');
var gm = require('gm');

// start chromedriver for selenium
var chromedriver = require('chromedriver');
chromedriver.start();

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


// get inputs
if (process.argv.length < 3 || process.argv.length > 3) {
    console.log('Command: ', process.argv);
    console.log('Usage: rasterize.js filename');
    return;
} else {
    var input = process.argv[2];
    console.log('input:', input);
}


var bounds;
globby(input).then(inputs => {

    console.log('glob(', input, ') ->', inputs);

    for (var i = 0; i < inputs.length; i++) {

        // get input file and components
        var file = inputs[i];
        var address = path.join(process.cwd(), file);
        var ext = path.extname(file);
        var url = 'file://' + path.join(process.cwd(), file);
        var outfile = address.replace(ext, '.png');

        // create panel elements temporarily

        console.log('Converting ', file, url, '->', outfile);

        client.init()
            .url(url)
            .waitForVisible('.front', 5000)
            // get image boundries from html
            .execute(function () {
                return $('#dimensions').text();
            })
            .then(text => {
                try {
                    bounds = JSON.parse(text.value);
                } catch (e) {
                    console.warn(text);
                }
            })
            // take a screen shot
            .screenshot()
            // crop using graphics magic
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
                        if (!err) console.log('done');
                    });

            })
            .end();

    }
}, this)
chromedriver.stop();
