import { mainLogic } from './fm_main_func.js';

// IIFE für das Frontend
(function (window, document, undefined) {
    mainLogic(window, document); // Standardaufruf im Frontend
})(window, document);