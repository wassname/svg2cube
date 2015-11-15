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
        flatten: 0, // fraction to vertically flatten the cube
        topUrl: '', // url for image in top of cuve
        topRot: 0, // rotation of top image in degrees
        topShad: 0, // shading for top
        leftUrl: '',
        leftRot: 0,
        leftShad: 0.1,
        rightUrl: '',
        rightRot: 0,
        rightShad: 0.3,
        svgNS: "http://www.w3.org/2000/svg",
        padding: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        perspective: 0,
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
    this.paper = Snap(this.cw, this.ch);
    this.svg=this.paper.node
    var o = this.options;

    var style = document.createElement('style');
    this.paper.defs.appendChild(style)
    var styleStr = ` <style>
                .cube, .cube .face, .cube .face * {
                  height: ${o.size}px;
                  width: ${o.size}px;
                }
                .cube {
                    position: absolute;
                    background-color: #f66;

                    -webkit-transform: translate(${this.cw/2}px,${0*this.ch/2}px) perspective(${o.perspective}px)  rotateX(${o.angle}deg)  rotateX(${o.rotateX}deg) rotateY(${o.rotateY}deg) rotateZ(${o.rotateZ}deg);
                    -webkit-transform-style: preserve-3d;
                    -webkit-transition: .25s;
                }


                .cube * {
                    transform-origin: 0% 100%;
                }

                .cube2 .top {
                    position: relative;
                    -webkit-transform: rotateX(45deg) rotateZ(-45deg) rotateX(0deg);
                    -webkit-transform-style: preserve-3d;
                    -webkit-transition: .25s;

                }
                .cube2 .left {
                    -webkit-transform:  rotateX(45deg) rotateZ(-45deg) rotateX(90deg);
                    -webkit-transform-style: preserve-3d;
                    -webkit-transition: .25s;
                    position: absolute;

                }
                .cube2 .right {
                    -webkit-transform: rotateX(45deg) rotateZ(-45deg) rotateY(90deg);
                    -webkit-transform-style: preserve-3d;
                    -webkit-transition: .25s;
                    position: absolute;
                }
            </style>`
    console.log(styleStr);
    style.innerHTML=       styleStr

}

/* drawing measurements as a function of padding */
SvgCube.prototype.measurements= function(p){
    if (p===undefined){
        p=0;
    }

    var f = this.options.flatten

    var tBox = this.imageT.getBBox()
    var lBox = this.imageL.getBBox()
    var rBox = this.imageR.getBBox()

    return {
        // measurements
        uf : 1-f,
        p  : 0, // lw/2, // padding

        tw: this.cw-p/2, // right side. adjust by half line thickness to keep line in canvas
        th: tBox.height-p/2, // height of square, and dist to middle

        mw: this.cw/2, // middle x
        mh: tBox.height/2,   // middle of top square

        bh: 0+p/2, // top of picture, bottom y
        bw: 0+p/2, // left of picture, bottom of x

        sw: this.cw-p/2,// bottom of cube
        sh: this.ch-p/2, // right of cube

        lq: -tBox.height/2+this.ch-p/2, // lower quarter of height
        uq: tBox.height/2+p/2 // upper quarter
    }
}


/*
 * Adds a svg transform to an element, the transform has the origin of
 * xi,yi fraction of the element, so 0.5,0.5 is the middle,
 * unlike normalsvg it adds transforms in order of application not reverse order
 * Usage: svgTransform(elementImage,'rotate',[45],0.5,0.5)
 * This would rotate 45 degrees around center of image
 */
SvgCube.prototype.svgTransform = function (element, op, inputs, xi, yi) {
    if (isNaN(xi)) {
        xi = 0.5;
    }
    if (isNaN(yi)) {
        yi = 0.5;
    }
    var svgBox = this.svg.getClientRects()[0]
    // this.paper.getBBox()
    var cbox = element.getBoundingClientRect();
    var x = cbox.left + xi * cbox.width -svgBox.left;
    var y = cbox.top + yi * cbox.height -svgBox.top;
    //
    var matrix = this.svg.createSVGMatrix()
    matrix = matrix.translate(x, y)
    matrix = matrix[op].apply(matrix, inputs);
    matrix = matrix.translate(-x, -y);

    var transform = this.svg.createSVGTransform();
    transform.setMatrix(matrix);
    //element.transform.baseVal.appendItem(transform); // for reverse order
    element.transform.baseVal.insertItemBefore(transform, 0) // normal order
}

/*
 * transform an element to be the left of an isometric cube
 * Inputs: dom element, angle in degrees, and xi,yi which
 * are the transform origin as a fraction of element size
 */
SvgCube.prototype.toLeft = function (element, angle, xi, yi) {
    // half it's width
    xi = 0
    yi = 1
    if (this.f>0){
        this.svgTransform(element, 'scaleNonUniform', [1,this.f],0.5,0.5)
    }
    this.svgTransform(element, 'translate', [-1, -1]) // pixel adjustment HACK
    this.svgTransform(element, 'scaleNonUniform', [1 / 2, 1 / 2], xi, yi)
        // skew it, in degrees
    this.svgTransform(element, 'skewY', [angle], xi, yi)

}

/*
 * transform an element to be the right of an isometric cube
 * Inputs: dom element, angle in degrees, and xi,yi which
 * are the transform origin as a fraction of element size
 */
SvgCube.prototype.toRight = function (element, angle, xi, yi) {
    xi = 1
    yi = 1
    if (this.f>0){
        this.svgTransform(element, 'scaleNonUniform', [1,this.f],0.5,0.5)
    }
    this.svgTransform(element, 'translate', [-1, -2]) // pixel adjustment HACK
    // half it's width to fiit in canvas
    this.svgTransform(element, 'scaleNonUniform', [1 / 2, 1 / 2], xi, yi)
    // skew it
    this.svgTransform(element, 'skewY', [-angle], xi, yi)

}

/*
 * transform an element to be the top of an isometric cube
 * Inputs: dom element, angle in degrees, and xi,yi which
 * are the transform origin as a fraction of element size
 */
SvgCube.prototype.toTop = function (element, angle, xi, yi) {
    var rot = angle * Math.PI / 180;
    this.svgTransform(element, 'translate', [-2, -1]) // pixel adjustment HACK

    // rotate so it's a diamond
    this.svgTransform(element, 'rotate', [45], xi, yi)
    // squish - along x axis to fit in canvas, along y axis for perspective change
    this.svgTransform(element, 'scaleNonUniform', [Math.sin(45 * Math.PI / 180), Math.tan(rot) * Math.sin(45 * Math.PI / 180)], xi, yi)
}

SvgCube.prototype.moveTop = function (element) {
    // align top of cube with top of canvas
    var cbox = element.getBoundingClientRect();
    this.svgTransform(element, 'translate', [-cbox.left + this.pPx, -cbox.top + this.pPx])
}

/*
 * align left of cube with top,
 * fit upper-left of left panel with middle-left of top panel
 */
SvgCube.prototype.moveLeft = function (elem, elemT) {
    var cboxL = elem.getBoundingClientRect();
    var cboxT = elemT.getBoundingClientRect();
    // align left
    var x = cboxT.left - cboxL.left
        // align top of left with half height of
    var y = cboxT.top - cboxL.top + cboxT.height / 2
    this.svgTransform(elem, 'translate', [x, y])
}

/*
 * align right of cube with top,
 * fit upper-right of right panel with middle-right of top panel
 */
SvgCube.prototype.moveRight = function (elem, elemT) {
    // line up left with top, move to half tops height, and to align left
    var cboxL = elem.getBoundingClientRect();
    var cboxT = elemT.getBoundingClientRect();

    // align right with right
    var x = cboxT.right - cboxL.right

    // align top of left with half height of
    var y = cboxT.top - cboxL.top + cboxT.height / 2
    this.svgTransform(elem, 'translate', [x, y])
}

/* draw outline get line color from option.strokeColor, and width from options.stroke-width */
SvgCube.prototype.drawOutline = function(lw){
    lw=lw||this.options.stroke["stroke-width"];
    var ms = this.measurements(lw/2)


    var tb = this.imageT.getBBox()
    var lb = this.imageL.getBBox()
    var rb = this.imageR.getBBox()

    // Draw outline of top
    var strTop=
        'M'+ms.mw   +' '+ms.th  +' '+  // Move to bottom
        'L'+ms.bw   +' '+ms.mh+' '+  // left
        'L'+ms.mw   +' '+ms.bh+   ' '+  // top
        'L'+ms.tw   +' '+ms.mh+' '+  // right
        'Z'                     // close
    var pathTop = this.paper.path(strTop);

    // // outline of left
    var strLeft=
        'M'+ms.mw  +' '+ms.th+' '+          // middle
        'L'+ms.bw  +' '+ms.uq+' '+     // left top
        'L'+ms.bw  +' '+ms.lq+' '+       // left bottom
        'L'+ms.mw  +' '+ms.sh+' '+          // middle bottom
        'Z'
    var pathLeft = this.paper.path(strLeft);
    //
    // right
    var strRight=
        'M'+ms.mw  +' '+ms.th+' '+           // middle
        'L'+ms.mw  +' '+ms.sh  +' '+         // middle bottom
        'L'+ms.tw  +' '+ms.lq+' '+  // right bottom
        'L'+ms.tw  +' '+ms.uq+' '+     // right top
        'Z'                          // close
    var pathRight = this.paper.path(strRight);

    // join into set
    var pathGroup = this.paper.group();
    pathGroup.append(pathTop);
    pathGroup.append(pathLeft);
    pathGroup.append(pathRight);

    // set attrs from options
    // ref http://raphaeljs.com/reference.html#Element.attr
    var blackList = ['url','target','src','title']
    for (var a in this.options.stroke){
        if (this.options.stroke.hasOwnProperty(a) && blackList.indexOf(a)<0){
            pathGroup.attr(a,this.options.stroke[a]);
        }
    }
    this.outline=pathGroup;
}


/* draw outline get line color from option.strokeColor, and width from options.stroke-width */
SvgCube.prototype.drawShading = function(lw){
    lw=lw||this.options.stroke["stroke-width"];
    var ms = this.measurements(0);
	var pathGroup = this.paper.g();

    var strTop=
        'M'+ms.mw   +' '+ms.th  +' '+  // Move to bottom
        'L'+ms.bw   +' '+ms.mh+' '+  // left
		'L'+ms.mw   +' '+ms.bh+   ' '+  // top
        'L'+ms.tw   +' '+ms.mh+' '+  // right
		'Z'                     // close
    var pathTop = this.paper.path(strTop);
	pathGroup.append(pathTop);

    // outline of left
    var strLeft=
		'M'+ms.mw  +' '+ms.th+' '+          // middle
        'L'+ms.bw  +' '+ms.uq+' '+     // left top
        'L'+ms.bw  +' '+ms.lq+' '+ // left bottom
        'L'+ms.mw  +' '+ms.sh+' '+          // middle bottom
		'Z'
    var pathLeft = this.paper.path(strLeft);
	pathGroup.append(pathLeft);

    // last line from middle down
    var strRight=
		'M'+ms.mw  +' '+ms.th+' '+           // middle
		'L'+ms.mw  +' '+ms.sh  +' '+         // middle bottom
		'L'+ms.tw  +' '+ms.lq+' '+  // right bottom
        'L'+ms.tw  +' '+ms.uq+' '+     // right top
		'Z'                          // close
    var pathRight = this.paper.path(strRight);
	pathGroup.append(pathRight);


	// style the set
	pathGroup.attr({
		'stroke': 'none',
		'fill': 'black',
		'stroke-width': 0,
		'stroke-opacity': 0,
		'stroke-linecap': 'round',
		'stroke-linejoin': 'round'
	});
	// shade each side, 0 is no shading, 1 is black
	pathTop.attr({'fill-opacity': this.options.topShad});
	pathLeft.attr({'fill-opacity': this.options.leftShad});
	pathRight.attr({'fill-opacity': this.options.rightShad});
	this.shading=pathGroup;

}

/*clip the cube using an elipse to give rounded corners */
SvgCube.prototype.clipCircle = function(amount){
    var cp = document.createElementNS("http://www.w3.org/2000/svg","clipPath")
    cp.id="cp";
    var rxc=51+4*(1-this.f)*(1-this.f);
    var ryc=50-2/Math.sqrt(1-this.f);
    cp.innerHTML = '<ellipse xmlns="http://www.w3.org/2000/svg" cx="50%" cy="50%" rx="'+rxc+'%" ry="'+ryc+'%" fill="white"/>'
    this.paper.node.getElementsByTagName("defs")[0].appendChild(cp);
    this.paper.node.setAttribute("clip-path","url(#cp)");
}


/* returns svg string */
SvgCube.prototype.toSVG = function(){
    var svg3 = this.paper.toString();
    //var svg = this.paper.node.outerHTML;
    //var svg2 = xmlserializer.serializeToString(this.paper.node);
    if (this.paper.node.attributes.getNamedItem("clip-path")){
        // patch svg export to add clip
        // HACK I have to add these manually to the export sadly as raphael.export doesn't handle them and also misses some recent change to canvas
        svg3=svg3.replace("<svg",'<svg clip-path="url(#cp)"')
        svg3=svg3.replace("<image",this.paper.node.getElementsByTagName("defs")[0].outerHTML+"<image")
        svg3=svg3.replace("clippath","clipPath")
        svg3=svg3.replace("clippath","clipPath")

    }
    return svg3
}

    /* draw cube from urls in options and outline according to options */
SvgCube.prototype.drawCube = function (){

    var imgS = this.options.size / Math.sqrt(2);
    this.cube = this.paper.g();
    this.cube.attr({
        class: 'cube cube2',
        id: "c2notnested",
    });
    this.leftImg = this.cube.image(this.options.leftUrl,0,0,imgS,imgS);
    this.leftImg.attr({
        class: 'face left',
    })
    this.rightImg = this.cube.image(this.options.rightUrl,0,0,imgS,imgS);
    this.rightImg.attr({
        class: 'face right',
    })
    this.topImg = this.cube.image(this.options.topUrl,0,0,imgS,imgS);
    this.topImg.attr({
        class: 'face top',
    })

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
        this.paper.remove();
        this.init();
        this.drawCube();
    }


try{
    module.exports=SvgCube
} catch(e){};
