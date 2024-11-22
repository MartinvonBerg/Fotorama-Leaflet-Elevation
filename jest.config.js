/*
export default {
  transform: {
      "^.+\\.[tj]sx?$": "babel-jest",
  },
};
*/
module.exports = {
  testMatch: ["**/__tests__/**/*.js?(x)", "**/?(*.)+(spec|test).js?(x)"],
};

module.exports = {
  transform: {
      "^.+\\.[t|j]sx?$": "babel-jest", // Transpile .js, .jsx, .ts, and .tsx files
      "^.+\\.mjs$": "babel-jest",     // Transpile .mjs files
  },
  moduleFileExtensions: ["js", "mjs", "jsx", "ts", "tsx", "json"], // Include all possible file types
  //extensionsToTreatAsEsm: [".ts", ".tsx", ".mjs", ".jsx"],         // Treat these as ES Modules
};