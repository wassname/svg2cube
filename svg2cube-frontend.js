'use strict';
/**
 * Frontend js file to generate an cube of svg's
 */

(function (exports) {
    exports.SvgCube = function (svgPanel, options) {

        // Inputs and options
        var defaultOptions = {
            rotateX: 30, // isometric angle
            rotateY: 45,
            rotateZ: 0,
            perspective: 0, // doesn't do anything usefull
            scaleX: 1.00,
            scaleY: 1.00, // flatten
            scaleZ: 1.00, // push face

            size: 400,
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
            topRot: 0, // rotation of top image in degrees
            topShad: 0, // shading for top
            leftRot: 0,
            leftShad: 0.0,
            rightRot: 0,
            rightShad: 0.0,
            backRot: 0,
            backShad: 0.0,
            bottomRot: 0,
            bottomShad: 0.0,
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
        options.svgPanel = svgPanel;
        this.options = options;
        console.log(svgPanel);


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

    exports.SvgCube.prototype.init = function () {

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

        /** Write sides if they have not already been written **/
        if ($('body>.cube').length === 0) {
            var cube = $('<div class="cube cube2"></div>');

            var imageFront = $('' +
                '<b width="256" height="256" class="front tint">' +
                '<svg class="face" width="100%" height="100%" viewBox="0 0 256 256" version="1.1"' +
                '     xmlns="http://www.w3.org/2000/svg"' +
                '     xmlns:xlink="http://www.w3.org/1999/xlink">' +
                '  <image x="-512" y="-256" width="1024" height="768" xlink:href="' + o.svgPanel + '" />' +
                '</svg>' +
                '</b>');
            cube.append(imageFront);

            var imageL = $('' +
                '<b width="256" height="256" class="left tint">' +
                '<svg class="face" width="100%" height="100%" viewBox="0 0 256 256" version="1.1"' +
                '     xmlns="http://www.w3.org/2000/svg"' +
                '     xmlns:xlink="http://www.w3.org/1999/xlink">' +
                '  <image x="-256" y="-256" width="1024" height="768" xlink:href="' + o.svgPanel + '" />' +
                '</svg>' +
                '</b>');
            cube.append(imageL);

            var imageRight = $('' +
                '<b width="256" height="256" class="right tint">' +
                '   <svg class="face" width="100%" height="100%" viewBox="0 0 256 256" version="1.1"' +
                '        xmlns="http://www.w3.org/2000/svg"' +
                '        xmlns:xlink="http://www.w3.org/1999/xlink">' +
                '     <image x="-768" y="-256" width="1024" height="768" xlink:href="' + o.svgPanel + '" />' +
                '   </svg>' +
                '</b>');
            cube.append(imageRight);

            var imageTop = $('' +
                '<b width="256" height="256" class="top tint">' +
                '<svg class="face" width="100%" height="100%" viewBox="0 0 256 256" version="1.1"' +
                '     xmlns="http://www.w3.org/2000/svg"' +
                '     xmlns:xlink="http://www.w3.org/1999/xlink">' +
                '  <image x="-512" y="0" width="1024" height="768" xlink:href="' + o.svgPanel + '" />' +
                '</svg>' +
                '</b>');
            cube.append(imageTop);

            var imageBack = $('' +
                '<b width="256" height="256" class="back tint">' +
                '<svg class="face" width="100%" height="100%" viewBox="0 0 256 256" version="1.1"' +
                '     xmlns="http://www.w3.org/2000/svg"' +
                '     xmlns:xlink="http://www.w3.org/1999/xlink">' +
                '  <image x="0" y="-256" width="1024" height="768" xlink:href="' + o.svgPanel + '" />' +
                '</svg>' +
                '</b>');
            cube.append(imageBack);

            var imageBottom = $('' +
                '<b width="256" height="256" class="bottom tint">' +
                '<svg class="face" width="100%" height="100%" viewBox="0 0 256 256" version="1.1"' +
                '     xmlns="http://www.w3.org/2000/svg"' +
                '     xmlns:xlink="http://www.w3.org/1999/xlink">' +
                '  <image x="0" y="0" width="1024" height="768" xlink:href="' + o.svgPanel + '" />' +
                '</svg>' +
                '</b>');
            cube.append(imageBottom);

            var target=$('#svg2cube');
            if (!target){target=$('body');}

            target.append(cube);

        }
        // Now we generate some css to put everything in good positions
        var transitions = 0.1;
        var styleStr = '' +
            '<style id="projection">     ' +
            '                .cube {    ' +
            '                    height: ' + this.ch + 'px;    ' +
            '                    width: ' + this.cw*2 + 'px;    ' +
            '                }    ' +
            '                 .face {    ' +
            '                  height: ' + o.size + 'px;    ' +
            '                  width: ' + o.size + 'px;    ' +
            '                }    ' +
            '                .cube {    ' +
            '                    position: relative;    ' +
            '                    -webkit-transform: translate(' + this.cw / 2 + 'px,' + 0 * this.ch / 2 + 'px) perspective(-' + o.perspective + 'px) rotateX(-' + o.rotateX + 'deg) rotateY(' + o.rotateY + 'deg) rotateZ(' + o.rotateZ + 'deg)   scaleX(' + o.scaleX + ')  scaleY(' + o.scaleY + ')  scaleZ(' + o.scaleZ + ');    ' +
            '                    -webkit-transform-style: preserve-3d;    ' +
            '                    -webkit-transition: ' + transitions + 's;    ' +
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
            '                .back>svg{    ' +
            '                     transform: rotate(' + o.backRot + 'deg);    ' +
            '                 }    ' +
            '                 .front>svg{    ' +
            '                      transform: rotate(' + o.frontRot + 'deg);    ' +
            '                  }    ' +
            '                .right>svg{    ' +
            '                      transform: rotate(' + o.rightRot + 'deg);    ' +
            '                }    ' +
            '                .left>svg{    ' +
            '                      transform: rotate(' + o.leftRot + 'deg);    ' +
            '                }    ' +
            '                .top>svg{    ' +
            '                     transform: rotate(' + 90 + o.topRot + 'deg);    ' +
            '                 }    ' +
            '                .bottom>svg{    ' +
            '                     transform: rotate(' + o.bottomRot + 'deg);    ' +
            '                 }    ' +
            '                b{    ' +
            '                  position:absolute;    ' +
            '                  transition: all ' + transitions + 's linear;    ' +
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
        $('head>#projection').remove();
        $('head').append($(styleStr));

    };

    /**
     * Get the bounds of the images for a screenshot
     * uses $.position to get min,max of each side of the image
     * @return {object} object.dimension.[min|max] e.g. object.left.min
     */
    exports.SvgCube.prototype.getBounds = function () {
        var bounds = {};
        $('.cube>b').each(function () {
            var pos = this.getBoundingClientRect();
            for (var dim in pos) {
                if (dim in pos) {

                    // init
                    if (bounds[dim] === undefined) {
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

    exports.SvgCube.prototype.update = function () {
        this.init();
    };
})(typeof exports === 'undefined' ? this['SvgCube'] = {} : exports);
