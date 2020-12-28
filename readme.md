# Description 

This is a Wordpress-Plugin to show a responsive image-slider with thumbnails (based on fotorama). The images are taken from a folder in the Wordpress upload-directory (uploaded via FTP). Under the image-slider an OpenStreetMap is shown. This map shows the GPX-position of the images and additionally a GPX-Track that was recorded during the excursion (based on GPXViewer). The map moves synchronously to the slider, e.g. it is centered to the GPS-Position of the current image. Under the map a height-chart of the GPX-track shown. Its track-data is shown on the map on mouse-over. 

The Plugin is fully responsive and SEO-friendly. It adds the images of the slider to the Yoast-XML-Sitemap and sets the alt-tag of the images (but not for the thumbnails). It is possible to use either the image-slider or the map with height-chart alone.

Although the images are expected in a folder of the Wordpress upload-directory they could have been added to the Wordpress-Media-Catalog before. If this is the case the responsive image srcset is used and the Wordpress-information of the Media-Catalog is used for the title and the alt-tag. It works only with JPG-Files an not with videos. Fotorama is able to tackle with videos but I'm looking for other developpers to provide that addition.

The Plugin sets additionally the custom-fields 'lon' and 'lat' of the post. This are the longitude and latitude of the first image or track-point. This coordinates are used by another plugin from me to show all posts on a map. See here: https://github.com/MartinvonBerg/wp_post_map_view_simple .

This plugin does not provide an Admin-Panel for its settings or the specific settings for a post. As well it has no interface to act as a Gutenberg-Block. I needed some help for that. **It runs with Wordpress 5.6**


# Donate
If you like this plugin buy me a coffee or a beer:

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CQA6XZ7LUMBJQ)

</br>    

# Usage

- Shortcode:  `[gpxview]`   **Use the code only once per page or post!**
- Parameters: <*'Parameter'*> => <*'Default-Value'*>

        'gpxpath' => 'gpx',
		'gpxfile' => 'test.gpx',
		'mapheight' => '450',
		'chartheight' => '150',
		'imgpath' => 'Bilder',    -- do not add slashes at the beginning or end
		'dload' => 'yes',
		'alttext' => '',          -- alt-text e.g description for the image-slider and the FIRST image
		'scale' => 1.0,           -- map-scale factor for GPXViewer
		'ignoresort' => false,    -- ignore custom sort even if provided by Wordpress, then sort by date ascending

- Example Shortcode: `[gpxview imgpath="Alben_Website/Bike-Hike-Lago-Lansfero" gpxfile="Bike-Hike-Lago-Lansfero.gpx" alttext="Bildergalerie mit Karte, GPX-Track und Höhenprofil zur Bike-Hike-Tour zum Lago Lansfero im Piemont in den italienischen Alpen"]`
- **Important: Only images with valid GPS-Coordinates in EXIF-Data are shown!** 

# Example
See under https://www.mvb1.de/info/wordpress-plugins/

## Screenshot

![screenshot_live_site](./wp_fotorama_gpx.PNG)

# Note prior to installation
1. Do a Backup!
2. It is not possible to minify the Javascript files of the GPXViewer. If so, it will fail e.g. not work. Therefore it is NOT possible to use the WP-Plugin
    - "Autoptimize" (https://wordpress.org/plugins/autoptimize/). If you prefer Autoptimize you can't use this plugin.
    - It works with "Asset Clean up" (https://wordpress.org/plugins/wp-asset-clean-up/ ). But the minification of the files of the GPXViewer has to be excluded:
        - Add the following code in the admin-window of "Asset Clean up" for the exceptions of minification and code-cleaning:
            - /wp-content/plugins/wp-fotorama-gpxviewer/(.*?).css 
            - /wp-content/plugins/wp-fotorama-gpxviewer/(.*?).js  
    - I did not test other Plugins for Code-Optimization but I except similar problems.
    - The plugin was tested with wordpress versions 5.3 - 5.5.3 and PHP 7.x

# Installation

0. Do a complete Back-up of your Wordpress-Site including SQL-Database!
1. Download the plugin-directory from github to a local -> *.zip
2. Install the zipped Plugin to the Wordpress-Plugin-Page (Upload zip in Admin-Backend). 
3. Activate the plugin through the 'Plugins' menu in Admin-Area of WordPress
4. Done!

# Update or De-Installation

1. Deactivate the plugin in Admin-Area of WordPress
2. Delete the Plugin-in. Stop here for De-Installation. Hint: The Wordpress-Database is not cleaned upon de-installation. The Custom-Fields (lat, lon, postimg) remain there!
3. Do Installation for the new version.

# Detailed Usage of the Image-Slider (Fotorama)
1. Preparation of Images (optional)

    - Generate Thubnails and rescale your Images.
    I used "ImageResizer for Windows" rescaled the former full-size images and generated thumbnails. The Thumbnails have to have '_thumb', '-thumb', '200x150' or '150x150' in their filename (e.g. image1-thumb.jpg). The minimum size should be 64 x 64px. Best is 150 x 150px.
    Optionally you can store the Thumbnails to a subfolder './thumbs' but that is not required.
    If you do not provide thumbnails the full-scaled images will be used. This will increase load time.
    
2. Upload images with ftp (FileZilla) or even Lightroom!
    - Upload the images from Step 1 to your Wordpress site e.g. with Filezilla. Upload to a Sub-Folder in 
./wp-content/uploads/. Do not use the WP-standard folders, like ./wp-content/uploads/2020/12!
        - Example:  ./wp-content/uploads/All_Albums/gallery1
    - Do not use 'thumb' or something like '4x5' or 200x150 or 150x150 (regex: [0-9]x[0-9]) in the filename for the full-size image. These files will be regarded as thumbnails and therefore ignored for the slider.
    - Up to now the images are NOT shown in the Media-Catalog of Wordpress
    - Note for Lightroom-Users: I also wrote a Lightroom-Plugin to upload the images directly to the Wordpress-Catalog and do the whole process in one Click! All image-work, updates, change of title, development can be done in Lightroom and the same image with unchanged Wordpress-ID is updated. The images in the Plugin are updated automatically. 
    - Example-Folder

        ![folder_overview](./screen_folder1.png)

3. Add the shortcode to you page or post (see above for the shortcode)

    Up to now only images are shown! If EXIF-Data for the caption is not provided it will be replaced by "--"   

4. Fotorama Options

    The Fotorama-Slider options are fixed with this line in the source-code of 'wp_gpxviewer.php:
    ```php
    $string  .= '<div id="fotorama" class="fotorama" data-auto="false" data-width="100%" data-fit="contain" data-ratio="1.5" data-nav="thumbs" data-allowfullscreen="native" data-keyboard="true" data-hash="true">';
    ```
    The CSS is set in wp_gpxviewer_style.css. Further Fotorama-options are to find under : https://fotorama.io/docs/4/options/ or in fotorama.dev.js starting at line 880 under "OPTIONS = {..."
    
5. TODO (german only, just a reminder for me)
    - Mean: maximale Breite der Gallerie prüfen. Irgendwas stimmt da nicht.
    - Minor: Umschaltung "data-fit" zwischen Inline-Anzeige und fullscreen-Anzeige: Keine Kontaktdaten vom Entwickler verfügbar und Debugging mit Chrome geht nicht. 

# Usage of the OpenStreetMap (GPXVIEWER)    
1. Preparation  (optional)

    Resize the GPX-Tracks with GPSBabel in a Batch-File (Windows-code):
    ```bat
    FOR %%i In (*.gpx) do GPSBabel -i gpx -f %%~i -x simplify,count=100 -o GPX -F %%~ni.gpx 
    ```
    The number of trackpoints is set by count (My File: GPS_Babel_GPX_Reducet.bat)
    

2. Upload GPX-Tracks
    - Upload the Tracks to the folder  ./wp-content/uploads/gpx with ftp. 
    - The Folder "gpx" can be choosen relative to "../wp-content/uploads/" with the parameter [gpxview ...gpxpath="*path-to-gpx*"]. 
         Do not use (Back)-Slashes ('/' or '\\')  at the beginning or end of *path-to-gpx*.

3. Activate the map including the track
    - Add the parameter to the Shortcode : [gpxview gpxfile="*Trackname.gpx*"].   Default: "test.gpx".
    - Without the parameter for the folder the the standard-folder ./wp-content/uploads/gpx/ is used.
    - It is possible to show more than one GPX-Track. Provide these by a comma separated list, e.g: gpxfile="Malle.gpx, Malle2.gpx, Malle3.gpx"
    - It is necessary to provide the track-file with the *.gpx extension always.
        
4. Options for the GPXViewer
- If not provided the default-values for parameters will be used.
- Map height: *mapheight=300*. Default : 450. Provide the number without '' or ""!
- Chart height: *chartheight=100*. Default : 150. Provide the number without '' or ""!
- Show link to download the GPX-Track, shown under the chart: *dload='no'*. Default : 'yes'. Provided only if you use ONE GPX-Track.
- Further options:      
    - In the source-code of 'wp_gpxviewer.php':
    ```php 
    $string  .= '<div id=map0 class="map gpxview:' . $gpxfile . ':OPENTOPO" style="width:100%;height:' . $mapheight . 'px"></div>';
    $string  .= '<div id="map0_profiles" style="width:100%;height:' . $chartheight . 'px"><div id="map0_hp" class="map" style="width:100%;height:' . $chartheight . 'px"></div></div>';
    ```
	- Styling in wp_gpxviewer_style.css! Change the  *.css directly, if you prefer other style-settings
    - All Options of GPXViewer:
        see: https://www.j-berkemeier.de/GPXViewer/#Zus%C3%A4tzliche
    - Javascript-Files:
        - All settings that were changed by me should be marked with  *Martin* 
        - Most settings are to find under   GPX2GM_Defs.js, starting at line 111 under "JB.GPX2GM.setparameters = function() { ..."   
       

5. TODOs & Bugs (german only, just a reminder for me)
    - Mean: update GPXViewer auf aktuelle Version 6.11! Läuft aber auch mit der alten Version 6.7! 
    - Minor: Infofenster mit Trackdaten wird von Anfang an angezeigt. Es werden aber nur die Daten des 1. Tracks angezeigt!   
    - Minor: TODO: Alle Daten, außer lat, long, ele aus dem GPX entfernen
    - Mean: GPX-Dateien OHNE Höhenangaben fürhen zu einem leeren Höhenprofil und einem Javascript-error im Browser, der aber nicht blockierend ist. Gallerie und Karte passen aber trotzdem
    - Mean: BUG: wenn die Wegpunkte einmal de- / re-aktiviert werden, folgt der Kreis nicht mehr dem Bild! Die Seite muss dann neu geladen werden! 
    - Minor: Minfiy der Dateien aus GMUTILS funktioniert nicht.
       

3. Combination of Image-Slider and OpenStreetMap (the intended use of the plugin):
    - Very simple: combine the above mentioned paramaters in ONE shortcode
    - It is only possible to use one shortcode per page or post. Otherwise it will fail.
    - The plugin sets the custom-fields *lat*, *Lon* and *postimg* at the status-transition from 'draft' to 'published' only. Not before. 	


# Frequently Asked Questions

There are no FAQs just yet.

# Changelog (In german)

= 0.4.0 =

First release: 18.03.2020

= 0.5.0 =

Second release: 1.04.2020

= 0.6.0 =

3rd release: 22.04.2020
 - SEO Opimierung für Fotorama (alt-tags mit title-Inhalt aus dem Bild in den img-Tags)
 - Variable Verarbeitung der thumbnails bei verschiedenen Endungen und Orten
 - Post GEO-Daten für Übersichtskarte werden jetzt nach Bild oder GPX-Track gesetzt, Option für den Shortcode ergänzt
 - scale-Faktor ergänzt: Dieser setzt den Faktor die Umskalierung bei Focus und Zentrierung auf das aktive Bild
 - fotorama.js aus der Development-Version ergänzt und minified
 - JB.Infofenster jetzt rechts unten. Änderung in osmutils.js

= 0.7.0 =

4th release: 20.06.2020
- Anzeige von Karte mit Foto-Icons auch OHNE GPX-Datei, Dabei wird OSM als Karte eingestellt

= 0.7.1 =

5th release: 30.08.2020
- lazy loading für img ergänzt

= 0.8.0 

6th release: 20.09.2020
- automatisches Setzen von custom fields 'lat' und 'lon' bei Statuswechsel von draft -> publish und löschen 
    bei Statuswechsel von publish -> draft ergänzt. Daher sollte eigentlich 'setpostgps' => 'no' nicht mehr nötig sein.

= 0.9.0 =

7th release: 25.09.2020
- ergänzen der Bilder aus dem fotorama-gpx-plugin in die yoast sitemap  

= 0.10.0 =

Yet another release: 4.12.2020
- Code rework and organisation. Translation to English
- read-out of WP-Media-Catalog added for img srcset, meta-data, exif-data etc.
- options for custom-fields and yoast-xml added

= 0.10.1 =

Yet another release: 10.12.2020
- Update for WP 5.6: deactivated useless alt and title in fotorama2.js for SEO
- Test with live site on www.mvb1.de

= 0.10.2 =

Yet another release: 13.12.2020
- Thumbnail size 200x150 added

= 0.11.0 =

Yet another release: 20.12.2020
- made Thumbnail size variable, depeinding on the admin setting for thumbnails
- introduced namespace for wordpress plugin compatiblity


# Upgrade Notice 

## Upgrade for Wordpress 5.6 is highly recommended!

# Screenshots

See : www.mvb1.de

# Credits 
This plugin uses the great work from:

- fotorama, see: https://fotorama.io/ Thank you for that!
- GPXViewer, see: https://www.j-berkemeier.de/GPXViewer/ Vielen Dank für den Support!
- wordpress for coding hints: https://de.wordpress.org/
