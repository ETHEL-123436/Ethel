module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Use worklets plugin with a unique name
      ['react-native-worklets/plugin', {}, 'worklets-plugin'],
      // Use reanimated plugin with a unique name
      ['react-native-reanimated/plugin', {}, 'reanimated-plugin'],
      '@babel/plugin-proposal-export-namespace-from'
    ],
  };
};
