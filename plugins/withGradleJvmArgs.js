const { withGradleProperties } = require('@expo/config-plugins');

const GRADLE_JVM_ARGS = '-Xmx4096m -XX:MaxMetaspaceSize=1024m';

module.exports = function withGradleJvmArgs(config) {
  return withGradleProperties(config, (config) => {
    const jvmArgsProperty = config.modResults.find(
      (item) => item.type === 'property' && item.key === 'org.gradle.jvmargs'
    );
    if (jvmArgsProperty) {
      jvmArgsProperty.value = GRADLE_JVM_ARGS;
    } else {
      config.modResults.push({
        type: 'property',
        key: 'org.gradle.jvmargs',
        value: GRADLE_JVM_ARGS,
      });
    }
    return config;
  });
};
