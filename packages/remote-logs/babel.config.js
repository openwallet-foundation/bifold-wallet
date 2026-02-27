module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-flow', { all: true }],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
}
