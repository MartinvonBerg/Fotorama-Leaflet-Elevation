# build a release for github
$OutputEncoding = [console]::InputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding

# create release directory if not existing
$path = ".\release"
New-Item "$($path)" -Force -itemType Directory

# copy php files from main folder to the same structure
Copy-Item ".\fotorama_multi.php" -Destination "$($path)\fotorama_multi.php" 
#Copy-Item ".\fotorama_multi_enq_scripts.php" -Destination "$($path)\fotorama_multi_enq_scripts.php" 
Copy-Item ".\uninstall.php" -Destination "$($path)\uninstall.php" 

# first build the new gutenberg block build files
npm run build

# create all js files 
npx webpack --config .\webpack.config.js

# create swiper bundle
#npx webpack --config .\webpack.swiper.js

# create fotorama bundle
#npx webpack --config .\webpack.fotorama.js

# create leaflet, leaflet-elevation bundle
#npx webpack --config .\webpack.leaflet.js
#npx webpack --config .\webpack.elevation.js

# copy gutenberg, swiper, fotorama, leaflet-map build files
$path = ".\release"
$path = "$($path)\build"
New-Item "$($path)" -Force -itemType Directory
robocopy .\build $path *.* /s /NFL /NDL /NJH /NJS

# ./css 
## ./css copy all images
$path = ".\release"
$path = "$($path)\css"
robocopy .\css $path *.png /s /NFL /NDL /NJH /NJS

## ./css copy only all minified css files
#$path = ".\release"
#$path = "$($path)\css"
#robocopy .\css $path *.min.css /s /xf Control* /xf leaflet* /NFL /NDL /NJH /NJS

# ./images
$path = ".\release"
$path = "$($path)\images"
robocopy .\images $path *.* /s /NFL /NDL /NJH /NJS

# ./inc
$path = ".\release"
$path = "$($path)\inc"
robocopy .\inc $path *.* /s /xf shortCodeTester.php /NFL /NDL /NJH /NJS

# ./js - use webpack before then copy
# *.js AND *.css and all loaded image files are processed.
### main
#$path = ".\release"
#$path = "$($path)\js"
#New-Item "$($path)" -Force -itemType Directory
#terser --keep-classnames --keep-fnames --mangle --ecma 5 .\js\fotorama-multi-reduced.js -o .\release\js\fotorama_main.js
#
### fotorama-bundle
#$path = ".\release"
#$path = "$($path)\js\fotorama"
#New-Item "$($path)" -Force -itemType Directory
# js for fotorama
#terser --keep-classnames --comment --keep-fnames --mangle --ecma 5 .\js\fotorama3.js .\js\zoom-master/jquery.zoom.js .\js\fotoramaClass.js -o .\release\js\fotorama\fotorama_bundle.js
# css for fotorama 
#minify .\css\fotorama_multi.css > .\release\js\fotorama\fotorama.min.css
#minify .\css\fotorama3.css >> .\release\js\fotorama\fotorama.min.css
#
### leaflet-map-bundle
#$path = ".\release"
#$path = "$($path)\js\leaflet"
#New-Item "$($path)" -Force -itemType Directory
# css for leaflet 
#minify .\js\leaflet\leaflet.css > .\release\js\leaflet\leaflet.min.css
#minify .\js\fullscreen\Control.FullScreen.css >> .\release\js\leaflet\leaflet.min.css
# js for leaflet
#minify .\js\leaflet\leaflet.js > .\release\js\leaflet\leaflet_map_bundle.js
#minify .\js\leaflet-ui\leaflet-ui-short.js >> .\release\js\leaflet\leaflet_map_bundle.js
#minify .\js\fullscreen\Control.FullScreen.js >> .\release\js\leaflet\leaflet_map_bundle.js
#minify .\js\leafletMapClass.js >> .\release\js\leaflet\leaflet_map_bundle.js
#terser --keep-classnames --comment --keep-fnames --mangle --ecma 5 .\js\leaflet\leaflet.js .\js\leaflet-ui\leaflet-ui-short.js .\js\fullscreen\Control.FullScreen.js .\js\leafletMapClass.js -o .\release\js\leaflet\leaflet_map_bundle.js 
# correction for german umlauts

# leaflet images
#$path = ".\release"
#$path = "$($path)\js\leaflet\images"
#New-Item "$($path)" -Force -itemType Directory
#robocopy .\js\leaflet\images $path *.* /s /NFL /NDL /NJH /NJS
#
### leaflet_elevation_bundle, js/leaflet_elevation/leaflet_elevation_bundle.js
#$path = ".\release"
#$path = "$($path)\js\leaflet_elevation"
#New-Item "$($path)" -Force -itemType Directory
# css
#minify .\js\elevation\dist\leaflet-elevation.css > .\release\js\leaflet_elevation\leaflet_elevation.min.css
# js
#minify .\js\elevation\dist\d3.min.js > .\release\js\leaflet_elevation\leaflet_elevation_bundle.js
#minify .\js\libs\gpx.min.js >> .\release\js\leaflet_elevation\leaflet_elevation_bundle.js
#minify .\js\elevation\libs\leaflet-gpxgroup.min.js >> .\release\js\leaflet_elevation\leaflet_elevation_bundle.js
#minify .\js\elevation\dist\togeojson.umd.js >> .\release\js\leaflet_elevation\leaflet_elevation_bundle.js
#minify .\js\elevation\dist\leaflet.geometryutil.min.js >> .\release\js\leaflet_elevation\leaflet_elevation_bundle.js
#minify .\js\elevation\dist\leaflet-elevation.min.js >> .\release\js\leaflet_elevation\leaflet_elevation_bundle.js
#minify .\js\elevationClass.js >> .\release\js\leaflet_elevation\leaflet_elevation_bundle.js
#terser --keep-classnames --comment --keep-fnames --mangle --ecma 5 .\js\elevation\dist\d3.min.js .\js\elevation\libs\leaflet-gpxgroup.min.js .\js\elevation\dist\togeojson.umd.js .\js\elevation\dist\leaflet.geometryutil.min.js .\js\elevation\dist\leaflet-elevation.js .\js\elevationClass.js -o .\release\js\leaflet_elevation\leaflet_elevation_bundle.js 

# copy leaflet-elevation dependencies
#$path = ".\release"
#$path = "$($path)\js\libs"
#New-Item "$($path)" -Force -itemType Directory
#robocopy .\js\elevation\libs $path *.* /s /NFL /NDL /NJH /NJS
#
#$path = ".\release"
#$path = "$($path)\js\src"
#New-Item "$($path)" -Force -itemType Directory
#robocopy .\js\elevation\src $path *.* /s /NFL /NDL /NJH /NJS

# TODO: webpack bundling does not work!
# npx webpack --config ./webpack.fotorama.js

# ./languages
$path = ".\release"
$path = "$($path)\languages"
robocopy .\languages $path *.* /s /NFL /NDL /NJH /NJS

# ./leaflet_map_tiles - without the subdirectories
$path = ".\release"
$path = "$($path)\leaflet_map_tiles"
robocopy .\leaflet_map_tiles $path *.* /NFL /NDL /NJH /NJS

# Finally write a warning that CSS-Files should have been minified before
Write-Warning "Hast Du die CSS-Files minimiert?"
Write-Warning "Nun den Inhalt vom realease-Ordner zippen als fotorama_multi.zip. Fertig"