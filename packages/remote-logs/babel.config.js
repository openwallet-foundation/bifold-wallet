module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-flow', { all: true }],
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
  ],
};
