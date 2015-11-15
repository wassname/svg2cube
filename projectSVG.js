'use strict';
// http://cssdeck.com/labs/pure-css-animated-isometric-boxes
try{
    var Snap = require('snapsvg');
} catch(e) {};

var SvgCube = function (options) {

    // Inputs and options
    var defaultOptions = {
        angle: 30,
        size: 64,
        verbose: false,
        // outline
        drawOutline: true,
        drawShading: true,
        clipCircle: false,
        stroke: {
            "arrow-end": 'none',
            "stroke": 'black', // stroke color for outline
            "stroke-width": Math.sqrt(options.size)/2, // outline width
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "fill": "none",
        },
        // cube
        flatten: 0, // fraction to vertically flatten the cube // scale Y
        topUrl: '', // url for image in top of cuve
        topRot: 0, // rotation of top image in degrees
        topShad: 0, // shading for top
        leftUrl: '',
        leftRot: 0,
        leftShad: 0.1,
        rightUrl: '',
        rightRot: 0,
        rightShad: 0.3,
        backUrl: '',
        backRot: 0,
        backShad: 0.3,
        bottomUrl: '',
        bottomRot: 0,
        bottomShad: 0.3,
        svgNS: "http://www.w3.org/2000/svg",
        padding: 0,
        rotateX: 45,
        rotateY: 45,
        rotateZ: 0,
        perspective: 0,
        scaleX: 1.00,
        scaleZ: 1.00,
    }

    // add defaults, 2 levels deep
    options = options || {};
    for (var opt in defaultOptions){
        if (defaultOptions.hasOwnProperty(opt) && !options.hasOwnProperty(opt)){
            options[opt] = defaultOptions[opt];
        }
        for (var opt2 in defaultOptions[opt]){
            if (defaultOptions[opt].hasOwnProperty(opt2) && !options[opt].hasOwnProperty(opt2)){
                    options[opt][opt2] = defaultOptions[opt][opt2];
            }
        }
    }
    this.options = options

    if (!options.drawOutline){
        options.stroke['stroke-width']=0;
    }

    this.init();

}

SvgCube.prototype.init = function(){

    this.angle = this.options.angle

    this.w = this.options.size; // input image width
    this.h = this.options.size;
    this.f = this.options.flatten

    this.rot = this.angle * Math.PI / 180
    this.padding = this.options.padding; // pading fraction


    this.cw = this.w; // we will keep same width but change height
    this.ch = (1 + this.padding) * (this.h / 2 + this.h * Math.tan(this.rot)) -this.h/2*(1-this.f); //canvas height full

    // create SVG element
    var o = this.options;

    //var style = document.createElement('style');
    //this.paper.defs.appendChild(style)
    var styleStr = ` <style id="projection">
                .cube, .cube .face, .cube .face * {
                  height: ${o.size}px;
                  width: ${o.size}px;
                }
                .cube {
                    position: absolute;
                    -webkit-transform: translate(${this.cw/2}px,${0*this.ch/2}px) perspective(-${o.perspective}px) rotateX(-${o.angle}deg) rotateY(${o.rotateY}deg) rotateZ(${o.rotateZ}deg)   scaleX(${o.scaleX})  scaleY(${1-o.flatten})  scaleZ(${o.scaleZ});
                    -webkit-transform-style: preserve-3d;
                    -webkit-transition: 0.25s;
                }

                .back {
                	transform: translateZ(-${o.size/2}px) rotateY(180deg);
                }
                .right {
                	transform: rotateY(-270deg) translateX(${o.size/2}px);
                    transform-origin: center right;
                }
                .left {
                	transform: rotateY(270deg) translateX(-${o.size/2}px);
                	transform-origin: center left;
                }
                .top {
                	transform: rotateX(-90deg) translateY(-${o.size/2}px);
                	transform-origin: top center;
                }
                .bottom {
                	transform: rotateX(90deg) translateY(${o.size/2}px);
                	transform-origin: bottom center;
                }
                .front {
                	transform: translateZ(${o.size/2}px);
                }
                b{
                  position:absolute;
                  transition: all 1s linear;
                }

                /* outline */
                .face {
                  box-sizing: border-box;
                  border: ${o.stroke['stroke-width']}px solid ${o.stroke.stroke};
                }

                /* shade in sides. But it seems to either mess up projection or not show */
                .wrap {
                  overflow: hidden;
                  width: 840px;
                  margin: 0 auto;
                }

                .tint {
                  position: absolute; /* works with relative but busts proj */
                }

                .tint:before {
                  content: "";
                  display: block;
                  position: absolute;
                  top: 0;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  transition: all .3s linear;
                }

                .tint:hover:before { background: none; }

                .tint>.top:before { background: rgba(0,0,0, ${o.topShad}); z-index:-1;}
                .tint>.left:before { background: rgba(0,0,0, ${o.leftShad}); z-index:2;}
                .tint>.right:before { background: rgba(0,0,0, ${o.rightShad}); z-index:-1;}
                .tint>.back:before { background: rgba(0,0,0, ${o.backShad}); }
                .tint>.front:before { background: rgba(0,0,0, ${o.frontShad}); }
                .tint>.bottom:before { background: rgba(0,0,0, ${o.bottomShad}); }
            </style>`
    //style.innerHTML=       styleStr

    if ($('body>.cube').length===0){
        var cube = $('<div class="cube cube2"></div>')

        var imageFront = $(`<b width="256" height="256" class="front tint"><embed type="image/svg+xml"  src="${o.frontUrl}" class="face"></embed></b>`)
        cube.append(imageFront);

        var imageL = $(`<b width="256" height="256" class="left tint"><embed type="image/svg+xml"  src="${o.leftUrl}" class="face"></embed></b>`)
        cube.append(imageL);

        var imageRight = $(`<b width="256" height="256" class="right tint"><embed type="image/svg+xml"  src="${o.rightUrl}" class="face"></embed></b>`)
        cube.append(imageRight);

        var imageTop = $(`<b width="256" height="256" class="top tint"><embed type="image/svg+xml"  src="${o.topUrl}" class="face"></embed></b>`)
        cube.append(imageTop);

        var imageBack = $(`<b width="256" height="256" class="back tint"><embed type="image/svg+xml"  src="${o.backUrl}" class="face"></embed></b>`)
        cube.append(imageBack);

        var imageBottom = $(`<b width="256" height="256" class="bottom tint"><embed type="image/svg+xml"  src="${o.bottomUrl}" class="face"></embed></b>`)
        cube.append(imageBottom);

        $('body').append(cube);

    }

    $('head>#projection').remove()
    $('head').append($(styleStr));

}

    /* draw cube from urls in options and outline according to options */
SvgCube.prototype.drawCube = function (){

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

}

    // svg2png
SvgCube.prototype.toPNG = function(){
        try{
            var dataUrl = svg2png(this.paper.node);
            img = document.createElement("img");
            document.body.appendChild(img)
            img.src=dataUrl
            img.id="toPNG"
        } catch (e) {console.log(e)};
    }

    // svg2png
SvgCube.prototype.toPNG2 = function(){
        var dataUrl = svg2png(this.paper.node);
        img = document.createElement("img");
        document.body.appendChild(img)
        img.src=dataUrl
        img.id="toPNG"
    }

    // svg2png
SvgCube.prototype.update = function(){
        //this.paper.remove();
        this.init();
        this.drawCube();
    }


try{
    module.exports=SvgCube
} catch(e){};
