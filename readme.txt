=== Slider Map Chart ===
Plugin Name: Slider Map Chart
Contributors: martinvonberg
Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CQA6XZ7LUMBJQ
Tags: slider, leaflet map, height chart, responsive, tile server
Requires at least: 5.9
Tested up to: 6.3
Stable tag: 0.23.2
Requires PHP: 7.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Adds a combination of Image Slider with, Leaflet Map and Height Chart by a shortcode. Admin Settings allow common settings for all shortcodes.


== Description ==

WordPress-Plugin to show a responsive Image Slider with images located in a separate FOLDER on your server or even in the WordPress Media Library. A thumbnail bar could be shown together with the image slider. Fotorama or Swiper is used for the slider. The Fotorama slider only works with JPG- or WEBP-Files an not with videos. Swiper works with Videos, too.

Optionally a Leaflet map is shown. This map shows the GPS-position of the images / videos and additionally a GPX-Track that was recorded during the excursion (leaflet elevation is used for that). The map moves synchronously to the slider, e.g. it is centred to the GPS-Position of the currently shown image. Under the map a height-chart of the GPX-track with its statistics is shown. The image slider may be used more than once per page. 

It is also possible to cache the leaflet tiles locally on your server. This procedure conforms to the guidelines of the osmfoundation (https://operations.osmfoundation.org/policies/tiles/). 
This option may be set by the admin panel. Furthermore, the conversion of the tiles into webp file format can be selected in order to meet Google Pagespeed requirements.
Note: The local file .htacces has to be changed for the correct path and the admin panel will show if the Redirection by the .htaccess is successful.

The Plugin is fully responsive (lazy loading, srcset if images are in WP-MediaLibrary) and SEO-friendly. It adds the images optionally to the Yoast-XML-Sitemap (Currently not maintained!) and sets the alt-tag of the images. It is possible to use either the image-slider or the map with height-chart alone. Or the map alone with a simple marker. An Image zoom is provided in fullscreen mode for Fotorama (desktop only) and in the slider for Swiper. With Swiper Slider the images may be shown in fullscreen mode with "Simple Lightbox with fslight" (another plugin from me, available as WP-Plugin: https://de.wordpress.org/plugins/simple-lightbox-fslight/)

If resized images and thumbnails are available in the folder, the responsive image srcset is used. If the images were added to WP-Media-Library the WordPress-information of the Media-Library is used for the title and the alt-tag.  

The Plugin sets additionally the custom-fields 'lon' and 'lat' of the post where the slider is used. This are the longitude and latitude of the first image or track-point. This coordinates are used by another plugin from me to show all posts in a map. See here: https://github.com/MartinvonBerg/wp_post_map_view_simple. Additionally it sets the start address of the excursion in a custom field an shows under the map with a link to google-maps to retrieve the route to the starting point. Attention: The server-setting 'allow_url_fopen' has to be 'ON' for this to work.

The Admin panel gives an overview of all shortcode parameters and allow to set them globally. Settings that have to be set individually for each slider are not provided in the Admin panel. The admin panel provides also an upload section for gpx-files with additionally size and point reduction and statistics calculation. 

Settings may be done by a Gutenberg Block, too (except: "showalltracks", "mapcenter", "zoom", "markertext" and others). But there is NO preview in Editor, it is still necessary to refresh the page on the frontend. Attention: Gutenberg is currently not up to date.

Save your plugin-settings to a JSON File on your local machine for later use e.g. if you want to deinstall the plugin for testing purposes.

Detailed Manual: https://github.com/MartinvonBerg/Fotorama-Leaflet-Elevation/blob/before_chartjs/readme.md.

== Live Example or Demo ==
See under https://www.berg-reise-foto.de/tourenbericht-skitour/skitour-auf-den-sextner-stein-in-sudtirol/
or any other travel or tour report on my page.


== Frequently Asked Questions ==

= How does the plugin work? =
Add shortcode with parameters to your page or post. Provide common settings in the Admin section.

= How to change the plugin settings? =
Change common or general settings in the Admin section of the Plugin.

= Does the plugin have any requirements? =
No. You can use this plugin with pure WordPress, with Gutenberg or Page Builders like Elementor.

= Is the lightbox responsive? =
Yes, the Slider - Map - Chart is fully responsive. But it relies an adequate settings for a CSS grid.

= Does the plugin use jQuery? =
Yes, the included Fotorama works with jQuery.

= Does the plugin provide a Gutenberg block.
Yes, a very basic one. Not all shortcode parameters are supported at the moment. 

= Is there a brief manual for those in a hurry?
Yes, here it is:
- Install current **Release** from Github of the Plugin or from WordPress.org and activate.
- Do all global, common settings for the plugin: Wordpress > Login to Admin > Settings > Slider-Map-Chart
- Upload photos to e.g. "-../wp-content/uploads/holiday2021/"
- Add this shortcode to post: [gpxview imgpath="holiday2021"] if photos **do have GPS-Data**.
- Add this shortcode to post: [gpxview imgpath="holiday2021" requiregps="false" showmap="false"] if photos **don't have GPS-Data**.
- Enjoy.

= Which WordPress and PHP versions are supported?
The Plugin runs from WordPress 5.9 - 6.3.x and PHP 7.4.2 - 8.2.0.

== Screenshots ==
1. Example Front End Output
2. Performance with Swiper
3. Back end DE 
4. Back end EN 
5. Back end IT 

== Upgrade Notice ==
None for the moment.

== Changelog ==

= 0.23.2 =
First Version for WordPress.org. See complete history in Github: https://github.com/MartinvonBerg/Fotorama-Leaflet-Elevation/blob/before_chartjs/readme.md

== Plugin uses ==

Following libraries and WP-Plugins were used to create this plugin:

See Github: https://github.com/MartinvonBerg/Fotorama-Leaflet-Elevation/blob/before_chartjs/readme.md
