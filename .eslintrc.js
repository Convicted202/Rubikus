module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:react/recommended', '@react-native-community', 'prettier'],
  plugins: ['eslint-plugin-react'],
  rules: {
    'object-curly-spacing': ['error', 'always'],
  },
};
