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

var config = {
    debug: true
}

var input = process.argv[2];
console.log('input:',input);


globby(input).then(inputs => {
    console.log('glob(',input,') =>', inputs);
    for (var i=0; i<inputs.length;i++){
        var file = inputs[i];
        
        var address = path.join(process.cwd(),file);
        var url = 'file://'+path.join(process.cwd(),file);
        var outfile = address.replace('.svg','.png');
        
        console.log(file, url,'=>',outfile);
        webdriverio
            .remote(options)
            .init()
            .url(url)
            .getTitle().then(function(title) {
                console.log('Title is: ' + title);
            })
            .saveScreenshot(
                [outfile],
                function(err, screenshot, response) { 
                    if (config.debug){
                        console.log({file,err,screenshot,response});
                    } else  if (err){
                        'saveScreenshot',console.log(err);
                    }
                }
            )
            .end();
    }
}, this)

