# build a release for github

# create release directory if not existing
$path = ".\release"
New-Item "$($path)" -Force -itemType Directory

# copy php files from main folder to the same structure
Copy-Item ".\fotorama_multi.php" -Destination "$($path)\fotorama_multi.php" 
Copy-Item ".\fotorama_multi_enq_scripts.php" -Destination "$($path)\fotorama_multi_enq_scripts.php" 
Copy-Item ".\uninstall.php" -Destination "$($path)\uninstall.php" 

# first build the new gutenberg block build files
npm run build

# copy gutenberg build files
$path = ".\release"
$path = "$($path)\build"
New-Item "$($path)" -Force -itemType Directory
robocopy .\build $path *.* /s /NFL /NDL /NJH /NJS

# ./css 
## ./css copy all images
#$path = ".\release"
#$path = "$($path)\css"
#robocopy .\css $path *.png /s /NFL /NDL /NJH /NJS

## ./css copy only all minified css files
#$path = ".\release"
#$path = "$($path)\css"
#robocopy .\css $path *.min.css /s /xf Control* /xf leaflet* /NFL /NDL /NJH /NJS

# ./images
#$path = ".\release"
#$path = "$($path)\images"
#robocopy .\images $path *.* /s /NFL /NDL /NJH /NJS

# ./inc
$path = ".\release"
$path = "$($path)\inc"
robocopy .\inc $path *.* /s /xf shortCodeTester.php /NFL /NDL /NJH /NJS

# ./js - use webpack before then copy
# *.js AND *.css and all loaded image files are processed.
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