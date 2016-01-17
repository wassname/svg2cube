'use strict';
/**
 * Frontend js file to generate an cube of svg's
 */
// http://cssdeck.com/labs/pure-css-animated-isometric-boxes



// polyfill for bind  https://github.com/ariya/phantomjs/issues/11281
if (!Function.prototype.bind) {
    console.log("Using polyfill of Function.prototype.bind");
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

var SvgCube = function (options) {

    // Inputs and options
    var defaultOptions = {
        rotateX: 30, // isometric angle
        rotateY: 45,
        rotateZ: 0,
        perspective: 0, // doesn't do anything usefull
        scaleX: 1.00,
        scaleY: 1.00, // flatten
        scaleZ: 1.00, // push face

        size: 256,
        verbose: false,
        // outline
        drawOutline: false,
        drawShading: false,
        borderRadius: 0,
        stroke: {
            "stroke": 'black', // stroke color for outline
            "stroke-width": 0, // outline width
        },
        // cube
        topUrl: '', // url for image in top of cuve
        topRot: 0, // rotation of top image in degrees
        topShad: 0, // shading for top
        leftUrl: '',
        leftRot: 0,
        leftShad: 0.0,
        rightUrl: '',
        rightRot: 0,
        rightShad: 0.0,
        backUrl: '',
        backRot: 0,
        backShad: 0.0,
        bottomUrl: '',
        bottomRot: 0,
        bottomShad: 0.0,
        frontUrl: '',
        frontRot: 0,
        frontShad: 0.0,
    };

    // add defaults, 2 levels deep
    options = options || {};
    for (var opt in defaultOptions) {
        if (defaultOptions.hasOwnProperty(opt) && !options.hasOwnProperty(opt)) {
            options[opt] = defaultOptions[opt];
        }
        for (var opt2 in defaultOptions[opt]) {
            if (defaultOptions[opt].hasOwnProperty(opt2) && !options[opt].hasOwnProperty(opt2)) {
                options[opt][opt2] = defaultOptions[opt][opt2];
            }
        }
    }
    this.options = options;

    // legacy compat
    if (options.flatten !== undefined) {
        options.scaleY = 1 - options.flatten;
    }
    if (options.angle !== undefined) {
        options.rotateX = options.angle;
    }

    if (!options.drawOutline) {
        options.stroke['stroke-width'] = 0;
    }

    this.init();

};

SvgCube.prototype.init = function () {

    this.rotateX = this.options.rotateX;

    this.w = this.options.size; // input image width
    this.h = this.options.size;
    this.f = 1 - this.options.scaleY;

    this.rot = this.rotateX * Math.PI / 180;
    this.padding = this.options.padding || 0; // pading fraction


    this.cw = this.w; // we will keep same width but change height
    this.ch = this.h * 5; //(this.h + Math.sqrt(2)*this.h * Math.tan(this.rot)) - this.h / 2 * (this.f); //canvas height full

    // create SVG element
    var o = this.options;

    // Now we generate some css to put everything in good positions
    var transitions = 0;
    var styleStr = '' +
        '<style id="projection">     ' +
        '                .cube {    ' +
        '                    height: ' + this.ch + 'px;    ' +
        '                    width: ' + this.cw + 'px;    ' +
        '                }    ' +
        '                 .face {    ' +
        '                  height: ' + o.size + 'px;    ' +
        '                  width: ' + o.size + 'px;    ' +
        '                }    ' +
        '                .cube {    ' +
        '                    position: absolute;    ' +
        '                    -webkit-transform: translate(' + this.cw / 2 + 'px,' + 0 * this.ch / 2 + 'px) perspective(-' + o.perspective + 'px) rotateX(-' + o.rotateX + 'deg) rotateY(' + o.rotateY + 'deg) rotateZ(' + o.rotateZ + 'deg)   scaleX(' + o.scaleX + ')  scaleY(' + o.scaleY + ')  scaleZ(' + o.scaleZ + ');    ' +
        '                    -webkit-transform-style: preserve-3d;    ' +
        '                    -webkit-transition: '+transitions+'s;    ' +
        '                }    ' +
        '                .back {    ' +
        '                	transform: translateZ(-' + o.size / 2 + 'px) rotateY(180deg);    ' +
        '                }    ' +
        '                .right {    ' +
        '                	transform: rotateY(-270deg) translateX(' + o.size / 2 + 'px);    ' +
        '                    transform-origin: center right;    ' +
        '                }    ' +
        '                .left {    ' +
        '                	transform: rotateY(270deg) translateX(-' + o.size / 2 + 'px);    ' +
        '                	transform-origin: center left;    ' +
        '                }    ' +
        '                .top {    ' +
        '                	transform: rotateX(-90deg) translateY(-' + o.size / 2 + 'px);    ' +
        '                	transform-origin: top center;    ' +
        '                }    ' +
        '                .bottom {    ' +
        '                	transform: rotateX(90deg) translateY(' + o.size / 2 + 'px);    ' +
        '                	transform-origin: bottom center;    ' +
        '                }    ' +
        '                .front {    ' +
        '                	transform: translateZ(' + o.size / 2 + 'px);    ' +
        '                }    ' +
        '                /* custom orientation/rotation settings for each image */    ' +
        '                .back>embed{    ' +
        '                     transform: rotate(' + o.backRot + 'deg);    ' +
        '                 }    ' +
        '                 .front>embed{    ' +
        '                      transform: rotate(' + o.frontRot + 'deg);    ' +
        '                  }    ' +
        '                .right>embed{    ' +
        '                      transform: rotate(' + o.rightRot + 'deg);    ' +
        '                }    ' +
        '                .left>embed{    ' +
        '                      transform: rotate(' + o.leftRot + 'deg);    ' +
        '                }    ' +
        '                .top>embed{    ' +
        '                     transform: rotate(' + 90 + o.topRot + 'deg);    ' +
        '                 }    ' +
        '                .bottom>embed{    ' +
        '                     transform: rotate(' + o.bottomRot + 'deg);    ' +
        '                 }    ' +
        '                b{    ' +
        '                  position:absolute;    ' +
        '                  transition: all '+transitions+'s linear;    ' +
        '                }    ' +
        '                /* outline */    ' +
        '                .face {    ' +
        '                  box-sizing: border-box;    ' +
        '                  border: ' + o.stroke['stroke-width'] + 'px solid ' + o.stroke.stroke + ';    ' +
        '                }    ' +
        '                /* shade in sides */    ' +
        '                .wrap {    ' +
        '                  overflow: hidden;    ' +
        '                  width: ' + o.size + 'px;    ' +
        '                  margin: 0 auto;    ' +
        '                }    ' +
        '                .tint {    ' +
        '                  position: absolute;    ' +
        '                }    ' +
        '                .tint:before {    ' +
        '                  content: "";    ' +
        '                  display: block;    ' +
        '                  position: absolute;    ' +
        '                  top: 0;    ' +
        '                  bottom: 0;    ' +
        '                  left: 0;    ' +
        '                  right: 0;    ' +
        '                }    ' +
        '                .tint:hover:before { background: none; }    ' +
        '                .tint.top:before { background: rgba(0,0,0, ' + o.topShad + ');}    ' +
        '                .tint.left:before { background: rgba(0,0,0, ' + o.leftShad + ');}    ' +
        '                .tint.right:before { background: rgba(0,0,0, ' + o.rightShad + ');}    ' +
        '                .tint.back:before { background: rgba(0,0,0, ' + o.backShad + '); }    ' +
        '                .tint.front:before { background: rgba(0,0,0, ' + o.frontShad + '); }    ' +
        '                .tint.bottom:before { background: rgba(0,0,0, ' + o.bottomShad + '); }    ' +
        '                /* curved cube. Need something block seeing through, and also extra faces, 1 px in, so inside looks uniform color. Only work for one main color */    ' +
        '                /*.face {    ' +
        '                    border-radius: ' + o.borderRadius + 'px;    ' +
        '                }    ' +
        '                .mid {    ' +
        '                    background-color: #e3e2db; /* make stroke color TODO */    ' +
        '                    border-radius: 0px;    ' +
        '                }*/    ' +
        '            </style>';


    if ($('body>.cube').length === 0) {
        var cube = $('<div class="cube cube2"></div>');

        var imageFront = $('<b width="256" height="256" class="front tint"><embed type="image/svg+xml"  src="' + o.frontUrl + '" class="face"></embed></b>');
        cube.append(imageFront);

        var imageL = $('<b width="256" height="256" class="left tint"><embed type="image/svg+xml"  src="' + o.leftUrl + '" class="face"></embed></b>');
        cube.append(imageL);

        var imageRight = $('<b width="256" height="256" class="right tint"><embed type="image/svg+xml"  src="' + o.rightUrl + '" class="face"></embed></b>');
        cube.append(imageRight);

        var imageTop = $('<b width="256" height="256" class="top tint"><embed type="image/svg+xml"  src="' + o.topUrl + '" class="face"></embed></b>');
        cube.append(imageTop);

        var imageBack = $('<b width="256" height="256" class="back tint"><embed type="image/svg+xml"  src="' + o.backUrl + '" class="face"></embed></b>');
        cube.append(imageBack);

        var imageBottom = $('<b width="256" height="256" class="bottom tint"><embed type="image/svg+xml"  src="' + o.bottomUrl + '" class="face"></embed></b>');
        cube.append(imageBottom);

        $('body').append(cube);


        /* TODO these will fill in some color inside in order to allow curved edges without seeing through cube, sues o.stroke.stroke for color */
        // var xMid = $(`<div width="256" height="256" class="face mid xMid"></div>`)
        // cube.append(xMid);
        //
        // var yMid = $(`<div width="256" height="256" class="face mid yMid"></b>`)
        // cube.append(yMid);
        //
        // var zMid = $(`<div width="256" height="256" class="face mid zMid"></div>`)
        // cube.append(zMid);


        $('body').append(cube);


    }

    $('head>#projection').remove();
    $('head').append($(styleStr));

};

/* draw cube from urls in options and outline according to options */
SvgCube.prototype.drawCube = function () {

    // var imgS = this.options.size / Math.sqrt(2);
    // this.cube = this.paper.g();
    // this.cube.attr({
    //     class: 'cube cube2',
    //     id: "c2notnested",
    // });
    // this.leftImg = this.cube.image(this.options.leftUrl,0,0,imgS,imgS);
    // this.leftImg.attr({
    //     class: 'face left',
    // })
    // this.rightImg = this.cube.image(this.options.rightUrl,0,0,imgS,imgS);
    // this.rightImg.attr({
    //     class: 'face right',
    // })
    // this.topImg = this.cube.image(this.options.topUrl,0,0,imgS,imgS);
    // this.topImg.attr({
    //     class: 'face top',
    // })

};

/**
 * Get the bounds of the images for a screenshot
 * uses $.position to get min,max of each side of the image
 * @return {[type]} [description]
 */
SvgCube.prototype.getBounds = function () {
    var bounds = {};
    $('.cube>b').each(function () {
        var pos = this.getBoundingClientRect();
        for (var dim in pos) {
            if (dim in pos) {

                // init
                if (bounds[dim]===undefined) {
                    bounds[dim] = {
                        'max': pos[dim],
                        'min': pos[dim]
                    };
                } else {
                    // get max and min
                    bounds[dim].max = Math.max(bounds[dim].max, pos[dim]);
                    bounds[dim].min = Math.min(bounds[dim].min, pos[dim]);
                }
            }
        }
    });
    return bounds;
};

/**
 * Get the bounds of the images for a screenshot
 * uses $.position to get min,max of each side of the image
 * @return {[type]} [description]
 */
SvgCube.prototype.getAllBounds = function () {
    var bounds = {};
    $('.cube>b').each(function () {
        var pos = this.getBoundingClientRect();
        for (var dim in pos) {
            if (dim in pos) {

                // init
                if (bounds[dim]===undefined) {
                    bounds[dim] = [];
                }
                // get max and min
                bounds[dim].push(pos[dim]);
            }
        }
    });
    return bounds;
};


SvgCube.prototype.update = function () {
    //this.paper.remove();
    this.init();
    this.drawCube();
    console.log(this.getBounds());
};
