const { withProjectBuildGradle } = require('@expo/config-plugins');

const KOTLIN_VERSION = '2.3.20';

module.exports = function withKotlinVersion(config) {
  return withProjectBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')",
      `classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:${KOTLIN_VERSION}')`
    );
    return config;
  });
};
