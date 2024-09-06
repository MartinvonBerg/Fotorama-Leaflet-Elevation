/*!
    colorLib.js 0.27.0
    license: GPL 2.0
    JS color library with helper functions for color calculations and conversions. Designed as esm module
    Martin von Berg, 2024
*/

export { calculateEquallyDistributedColors };

/**
     * Calculates equally distributed colors based on a starting color hex value.
     *
     * @param {string} startHex - The starting color hex value e.g. '#aa1111'.
     * @param {number} numColors - The number of colors to calculate.
     * @return {Array<string>} The array of equally distributed colors.
     */
function calculateEquallyDistributedColors(startHex, numColors) {
    // Parse the starting color hex value
    const r = parseInt(startHex.slice(1, 3), 16);
    const g = parseInt(startHex.slice(3, 5), 16);
    const b = parseInt(startHex.slice(5, 7), 16);
  
    // Convert to HSL color space
    const hslStart = rgbToHsl(r, g, b);
  
    // Calculate the step size for equally distributed colors
    const step = 360 / numColors;
  
    // Calculate the colors
    const colors = [];
    colors.push(startHex);

    for (let i = 1; i < numColors; i++) {
      const hue = (hslStart.h + i * step) % 360;
      const hexColor = hslToHex(hue, hslStart.s, hslStart.l);
      colors.push(hexColor);
    }
  
    return colors;
};
  
/**
 * Converts an RGB color to HSL color.
 *
 * @param {number} r - The red component of the RGB color (0-255).
 * @param {number} g - The green component of the RGB color (0-255).
 * @param {number} b - The blue component of the RGB color (0-255).
 * @return {object} An object representing the HSL color with properties h, s, and l.
 */
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
  
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
  
    let h, s, l = (max + min) / 2;
  
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
  
      h /= 6;
    }
  
    return { h: h * 360, s: s, l: l };
};

/**
 * Converts an HSL color to a hexadecimal color code.
 *
 * @param {number} h - The hue value of the HSL color (0-360).
 * @param {number} s - The saturation value of the HSL color (0-1).
 * @param {number} l - The lightness value of the HSL color (0-1).
 * @return {string} The hexadecimal color code.
 */
function hslToHex(h, s, l) {
    // treatment of wrong input values
    if ( (h<0) || (h>360) || (s<0) || (s>1) || (l<0) || (l>1) ) {
          return '#000000';
    }
  
    const C = (1 - Math.abs(2 * l - 1)) * s;
    const X = C * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - C / 2;
    let r, g, b;
  
    if (0 <= h && h < 60) {
      r = C;
      g = X;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = X;
      g = C;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = C;
      b = X;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = X;
      b = C;
    } else if (240 <= h && h < 300) {
      r = X;
      g = 0;
      b = C;
    } else {
      r = C;
      g = 0;
      b = X;
    }
  
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
  
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;
};