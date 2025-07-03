//@react-native-clipboard/clipboard mock
module.exports = {
  getString: jest.fn(() => Promise.resolve('mocked clipboard content')), // eslint-disable-line no-undef
  setString: jest.fn(() => Promise.resolve()), // eslint-disable-line no-undef
  hasString: jest.fn(() => Promise.resolve(true)), // eslint-disable-line no-undef
}
