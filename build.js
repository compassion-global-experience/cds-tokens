const StyleDictionaryPackage = require("style-dictionary");
const { fileHeader, formattedVariables } = StyleDictionaryPackage.formatHelpers;
const { kebabCase, isPx, transformShadow } = require("./utils");

/**
 * format for css variables
 */
StyleDictionaryPackage.registerFormat({
  name: "css/variables",
  formatter: function (dictionary, config) {
    return `${this.selector} {
        ${dictionary.allProperties
          .map((prop) => `  --${prop.name}: ${prop.value};`)
          .join("\n")}
      };`;
  },
});

/**
 * format for scss variables
 */
//  StyleDictionaryPackage.registerFormat({
// 	name: "scss/variables",
// 	formatter: function(dictionary, config) {
// 	  return `${this.selector} {
// 		  ${dictionary.allProperties
// 			.map((prop) => `  $${prop.name}: ${prop.value};`)
// 			.join("\n")}
// 		}`;
// 	},
//   });

StyleDictionaryPackage.registerTransform({
  name: "sizes/px",
  type: "value",
  transitive: true,
  matcher: (token) => {
    return (
      token.type === "fontSizes" ||
      token.type === "spacing" ||
      token.type === "spacing" ||
      token.type === "borderRadius" ||
      token.type === "borderWidth" ||
      token.type === "sizing" ||
      token.type === "lineHeights"
    );
  },
  transformer: (token) => {
    return token.value + "px";
  },
});

/**
 * Transform shadow shorthands for css variables
 */

StyleDictionaryPackage.registerTransform({
  name: "shadow/shorthand",
  type: "value",
  transitive: true,
  matcher: (token) => ["boxShadow"].includes(token.type),
  transformer: (token) => {
    return Array.isArray(token.original.value)
      ? token.original.value.map((single) => transformShadow(single)).join(", ")
      : transformShadow(token.original.value);
  },
});

// transform: composite typography to shorthands
StyleDictionaryPackage.registerTransform({
  name: "typography/shorthand",
  type: "value",
  transitive: true,
  matcher: (token) => token.type === "typography",
  transformer: (token) => {
    const { value } = token;
    return `${value.fontSize + "px"}/${value.lineHeight + "px"} ${
      value.fontFamily
    } ${value.fontWeight}`;
  },
});

StyleDictionaryPackage.registerTransform({
  name: "value/quote",
  type: "value",
  matcher: function (prop) {
    return ["latinWebfont", "webfont", "url"].includes(prop.attributes.subitem);
  },
  transformer: function (prop) {
    return '"' + prop.original.value + '"';
  },
});

function getStyleDictionaryConfig(theme) {
  return {
    source: [`tokens/${theme}/*.json`],
    platforms: {
      scss: {
        buildPath: `dist/scss/variables/`,
        transforms: [
          "attribute/cti",
          "name/cti/kebab",
          "typography/shorthand",
          "sizes/px",
          "shadow/shorthand",
          "value/quote",
        ],
        // map the array of token file paths to style dictionary output files
        files: [
          {
            destination: `${theme}.css`,
            format: `css/variables`,
            selector: `.${theme}-theme`,
          },
        ],
      },
    },
  };
}

console.log("Building tokens...");

["_cds-light", "_cds-dark"].map(function (theme) {
  console.log("\n==============================================");
  console.log(`\nProcessing: [${theme}]`);

  const StyleDictionary = StyleDictionaryPackage.extend(
    getStyleDictionaryConfig(theme)
  );

  const platforms = ["scss"];
  platforms.map((platform) => {
    return StyleDictionary.buildPlatform(platform);
  });

  console.log("\nEnd processing");
});

console.log("\n==============================================");
console.log("\nBuild completed!");
