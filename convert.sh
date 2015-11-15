cairosvg manual_good_30.svg -o manual_good_30.png


for i in *.svg; do cairosvg $i -o `echo $i | sed -e 's/\.svg$/1.png/'`; done
for i in *.svg; do rsvg-convert -a $i -o `echo $i | sed -e 's/\.svg$/2.png/'`; done
for i in *.svg; do phantomjs rasterise.js $i `echo $i | sed -e 's/\.svg$/3.png/'`; done
