'use strict';
/**
 * Node js script to render and download svg cubes using webdriver
 */

var webdriverio = require('webdriverio');
var path = require('path');
var fs = require('fs');
var system = require('system')
var globby = require('globby');

var options = {
    desiredCapabilities: {
        browserName: 'chrome'
    }
};


/** TODO
 * Need to look at clien bounding box for all parts of cube, then get minLeft, maxRight etc, then crop the screenshot there
 *
 **/

// get config
var config = {
    debug: false
}

// get inputs
var input = process.argv[2];
console.log('input:', input);


/**
 * Screenshot for debug and notification of screenshots
 */
var screenHandler = function (err, screenshot, response) {
    if (config.debug) {
        console.log({
            err, screenshot, response
        });
    } else if (err) {
        console.log('saveScreenshot', err);
    }
}

globby(input).then(inputs => {

    console.log('glob(', input, ') ->', inputs);

    for (var i = 0; i < inputs.length; i++) {

        // get input file and components
        var file = inputs[i];
        var address = path.join(process.cwd(), file);
        var ext = path.extname(file);
        var url = 'file://' + path.join(process.cwd(), file);
        var outfile = address.replace(ext, '.png');

        console.log('Converting ', file, url, '->', outfile);

        webdriverio
            .remote(options)
            .init()
            .url(url)
            .getTitle().then(title => {
                console.log('Title is: ' + title);
            })
            .waitForVisible('.front', 1000) //.then(callback);
            .saveScreenshot(
                outfile, screenHandler
            )
            .end();
    }
}, this)
