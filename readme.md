# svg2cube

Generate isometric game sprites. Input an svg panel and it's folded into a cube and rendered from any angle. [Example hosted here](https://wassname.github.io/svg2cube/).

# Quickstart

```bash
git clone git@github.com:wassname/svg2cube.git
cd svg2cube
npm i
node svg2cube-cli.js inputs/panels.svg
```

# Screenshots
## Input:
<img src="images/input.png" style="max-width: 10em;"></img>

## Output:
<img src="images/result.png" style="max-width: 10em;"></img>

## GUI
<img src="images/gui.png" style="max-width: 10em;"></img>

# Installation
`npm i`

# Usage
First try it using the supplied panel. From the command line:

```sh
node svg2cube-cli.js inputs/panels.svg
```

Or in node:

```js
var svg2cube = require('./svg2cube.js');
svg2cube('inputs/panels.svg',{rotateY: 45, size:256});
```

Now create your own panel and generate your own sprites. Available options are
[here for now](https://github.com/wassname/svg2cube/blob/master/svg2cube-frontend.js#L10).

# Description

This project take in an image and folds it into a cube then takes a picture. It's best used for generating isometric game sprites and is best explained by looking at the screenshots and example.

The input image is an unfolded cube which is folded like origami, then CSS-3D transforms are used to show the box from any angle. This could be the classic isometric angle used in isometric arcade games. The output image is rendered as a png using chrome webdriver and cropped using graphicsmagick.

Note that phantomjs can't be used because it doesn't support CSS-3D transforms.

# Author
wassname.org

# License
MIT
