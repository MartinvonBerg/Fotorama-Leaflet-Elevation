# Notes about Translation and i18n

**This Plugin does not use the WordPress Standard way of providing translations.**

## Translation with __()
This WordPress Function is overloaded. It is re-defined in the file locales_i18n.php. The function just calls the translate function t().
t() itself includes the array with string that will be translated. Currently foreseen are DE, IT, ES, FS. The arrays for DE and IT are complete, the others not. English is coded in PHP. This function also includes some strings for translation on the front-end. These are 'Download' and 'Start address'.

## Translation in JavaScript
Only some translations are required for JS. These are included in 'leafletMapClass.js' in the class method 'setLanguage'. The principle is the same as in PHP. Note: Some leaflet Help text could not be translated, although provided. 

## Translation of Admin-Pages
The main translation part has to be done on the Admin-Pages. (The Plugin itself mainly produces graphical output. So little translation is required for the front-end.)
The Admin-Pages are generated from arrays. This is also not a standard-way of producing HTML for Admin-Pages. The arrays include all information required to show the Admin-Tabs. 
So the function 'translateSettingsArray' in the file admin_settings.php does all the translation: It checks whether a json-File with the current settings array name and the ending 'de-DE', 'it-IT' or so is available and overrides dedicated strings with provided translations.
So, the folder ./languages contains many json-Files for translations. The translation was done with deepl.com. The complete json-File is pasted to the web front end of deepl.com and the output will be given on the right side. Some minor corrections for incorrect json-Format are usually required but that's it. 
Another helper function detects the language setting of the Admin dashboard which could be different from the webpage language.

## Reasons
For me the translation in WordPress is rather annoying. One needs:
- Poedit which is fully available in a paid version or 
- another Software which is currently not maintained or
- needs to fiddle around with wp-cli
- The translation process is manually ore a very long copy-paste action of strings to deepl.com
- Update of generated *.pot, *.po and *.mo files is possible, but takes some time and knowledge
- The WP-Team itself claims the i18n process to be slow. So, why should I use it? 
- This is my personal opinion.


