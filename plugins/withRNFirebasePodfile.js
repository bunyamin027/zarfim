/**
 * Config plugin — React Native Firebase iOS Podfile ayarları.
 *
 * Firebase iOS SDK'nın SPM ürünleri statik framework linkleme ile
 * duplicate-symbol hatası veriyor. Bu plugin `npx expo prebuild` sonrası
 * Podfile'ın en üstüne RNFirebase değişkenlerini ekler:
 *   $RNFirebaseAsStaticFramework = true
 *   $RNFirebaseDisableSPM = true
 * (useFrameworks: "static" ayarı expo-build-properties ile app.json'da.)
 */
const { withPodfile } = require('expo/config-plugins');

const LINES = ['$RNFirebaseAsStaticFramework = true', '$RNFirebaseDisableSPM = true'];

module.exports = function withRNFirebasePodfile(config) {
  return withPodfile(config, (cfg) => {
    let contents = cfg.modResults.contents;
    const missing = LINES.filter((l) => !contents.includes(l));
    if (missing.length) {
      contents = missing.join('\n') + '\n' + contents;
    }
    cfg.modResults.contents = contents;
    return cfg;
  });
};
