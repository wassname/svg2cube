'use strict';
/**
 * Frontend js file to generate an cube of svg's
 */

(function (exports) {
    exports.SvgCube = function (svgPanel, options) {

        // Inputs and options
        this.defaultOptions = {

            rotateX: 30, // isometric perspective in degrees
            rotateY: 45,
            rotateZ: 0,

            scaleX: 1.00, // fraction of size from left to right, 0.5 shrinks to 50%. 1 keeps it at 100% size
            scaleY: 1.00, // likewise flatten from top
            scaleZ: 1.00, // likewise flatten from front

            size: 400, // size of one side (should not be bigger than ~half browser height or width)

            // outline
            drawOutline: false,
            drawShading: false,
            borderRadius: 2, // in px
            stroke: {
                "stroke": 'black', // stroke color for outline
                "stroke-width": 0, // outline width in px
            },

            // cube
            topRot: 0, // clockwise rotation of top image in degrees, int 0-360, e.g. 180 will make a face upside down without changing the cube geometry.
            leftRot: 0,
            rightRot: 0,
            backRot: 0,
            bottomRot: 0,
            frontRot: 0,

            topShad: 0, // shading for top, float from 0 to 1
            leftShad: 0.3,
            rightShad: 0.1,
            backShad: 0.0,
            bottomShad: 0.0,
            frontShad: 0.0,

            // turn off rendering of sides so you can make isometric tiles
            leftRender: true,
            topRender: true,
            bottomRender: true,
            rightRender: true,
            frontRender: true,
            backRender: true,

            perspective: 0, // doesn't do anything usefull

        };

        // add defaults to input options, looking 2 levels deep
        options = options || {};
        for (var opt in this.defaultOptions) {
            if (this.defaultOptions.hasOwnProperty(opt) && !options.hasOwnProperty(opt)) {
                options[opt] = this.defaultOptions[opt];
            }
            for (var opt2 in this.defaultOptions[opt]) {
                if (this.defaultOptions[opt].hasOwnProperty(opt2) && !options[opt].hasOwnProperty(opt2)) {
                    options[opt][opt2] = this.defaultOptions[opt][opt2];
                }
            }
        }

        options.svgPanel = svgPanel;
        this.options = options;

        // Add a couple of obvious options
        if (this.options.flatten !== undefined) {
            this.options.scaleY = 1 - this.options.flatten;
        }
        if (this.options.angle !== undefined) {
            this.options.rotateX = this.options.angle;
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



        /** Write sides **/
        var cube = $('<div class="cube cube2"></div>');

        var imageFront = $('' +
            '<b width="256" height="256" class="front tint">' +
            '<svg class="face" width="100%" height="100%" viewBox="0 0 256 256" version="1.1"' +
            '     xmlns="http://www.w3.org/2000/svg"' +
            '     xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '  <image x="-512" y="-256" width="1024" height="768" xlink:href="' + o.svgPanel + '" />' +
            '</svg>' +
            '</b>');
        if (this.options.frontRender) {
            cube.append(imageFront);
        }

        var imageL = $('' +
            '<b width="256" height="256" class="left tint">' +
            '<svg class="face" width="100%" height="100%" viewBox="0 0 256 256" version="1.1"' +
            '     xmlns="http://www.w3.org/2000/svg"' +
            '     xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '  <image x="-256" y="-256" width="1024" height="768" xlink:href="' + o.svgPanel + '" />' +
            '</svg>' +
            '</b>');
        if (this.options.leftRender) {
            cube.append(imageL);
        }

        var imageRight = $('' +
            '<b width="256" height="256" class="right tint">' +
            '   <svg class="face" width="100%" height="100%" viewBox="0 0 256 256" version="1.1"' +
            '        xmlns="http://www.w3.org/2000/svg"' +
            '        xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '     <image x="-768" y="-256" width="1024" height="768" xlink:href="' + o.svgPanel + '" />' +
            '   </svg>' +
            '</b>');
        if (this.options.rightRender) {
            cube.append(imageRight);
        }

        var imageTop = $('' +
            '<b width="256" height="256" class="top tint">' +
            '<svg class="face" width="100%" height="100%" viewBox="0 0 256 256" version="1.1"' +
            '     xmlns="http://www.w3.org/2000/svg"' +
            '     xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '  <image x="-512" y="0" width="1024" height="768" xlink:href="' + o.svgPanel + '" />' +
            '</svg>' +
            '</b>');
        if (this.options.topRender) {
            cube.append(imageTop);
        }

        var imageBack = $('' +
            '<b width="256" height="256" class="back tint">' +
            '<svg class="face" width="100%" height="100%" viewBox="0 0 256 256" version="1.1"' +
            '     xmlns="http://www.w3.org/2000/svg"' +
            '     xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '  <image x="0" y="-256" width="1024" height="768" xlink:href="' + o.svgPanel + '" />' +
            '</svg>' +
            '</b>');
        if (this.options.backRender) {
            cube.append(imageBack);
        }

        var imageBottom = $('' +
            '<b width="256" height="256" class="bottom tint">' +
            '<svg class="face" width="100%" height="100%" viewBox="0 0 256 256" version="1.1"' +
            '     xmlns="http://www.w3.org/2000/svg"' +
            '     xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '  <image x="0" y="0" width="1024" height="768" xlink:href="' + o.svgPanel + '" />' +
            '</svg>' +
            '</b>');
        if (this.options.bottomRender) {
            cube.append(imageBottom);
        }


        // get destination dom
        var target = $('#svg2cube');
        if (!target) {
            target = $('body');
        }

        // remove old sides
        target.find('.cube').remove();

        target.append(cube);


        // Now we generate some css to put everything in good positions
        var transitions = 0.1;
        var styleStr = '' +
            '<style id="projection">     ' +
            '                .cube {    ' +
            '                    height: ' + this.ch + 'px;    ' +
            '                    width: ' + this.cw * 2 + 'px;    ' +
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
            '                  border: ' + o.drawOutline * o.stroke['stroke-width'] + 'px solid ' + o.stroke.stroke + ';    ' +
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
            '                .tint:after {    ' +
            '                  content: "";    ' +
            '                  display: block;    ' +
            '                  position: absolute;    ' +
            '                  top: 0;    ' +
            '                  bottom: 0;    ' +
            '                  left: 0;    ' +
            '                  right: 0;    ' +
            '                }    ' +
            '                .tint:hover:after { background: none; }    ' +
            '                .tint.top:after { background: rgba(0,0,0, ' + o.drawShading * o.topShad + ');}    ' +
            '                .tint.left:after { background: rgba(0,0,0, ' + o.drawShading * o.leftShad + ');}    ' +
            '                .tint.right:after { background: rgba(0,0,0, ' + o.drawShading * o.rightShad + ');}    ' +
            '                .tint.back:after { background: rgba(0,0,0, ' + o.drawShading * o.backShad + '); }    ' +
            '                .tint.front:after { background: rgba(0,0,0, ' + o.drawShading * o.frontShad + '); }    ' +
            '                .tint.bottom:after { background: rgba(0,0,0, ' + o.drawShading * o.bottomShad + '); }    ' +
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
