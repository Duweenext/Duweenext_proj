// babel.config.js (TEMP)
module.exports = (api) => {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',               // keep as plugin
      'react-native-reanimated/plugin',  // MUST be last
    ],
  };
};
