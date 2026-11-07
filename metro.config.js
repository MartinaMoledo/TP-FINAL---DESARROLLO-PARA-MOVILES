const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Le enseñamos a Expo a leer el formato .wasm que pide expo-sqlite
config.resolver.assetExts.push('wasm');

module.exports = config;
