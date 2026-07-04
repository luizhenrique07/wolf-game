const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

module.exports = function withAdIdPermission(config) {
  return withAndroidManifest(config, (config) => {
    AndroidConfig.Permissions.ensurePermissions(config.modResults, [
      'com.google.android.gms.permission.AD_ID',
    ]);
    return config;
  });
};
