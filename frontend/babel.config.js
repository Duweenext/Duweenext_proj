module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        
      ],
      env: {
        production: {
          plugins: [
            'react-native-paper/babel',
            'nativewind/babel',
          ],
        },
      },
    };
  };