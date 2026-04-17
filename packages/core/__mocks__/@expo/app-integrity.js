module.exports = {
  attestKeyAsync: jest.fn(() => Promise.resolve('attested key')), // eslint-disable-line no-undef
  generateKeyAsync: jest.fn(() => Promise.resolve('key')), // eslint-disable-line no-undef
  generateHardwareAttestedKeyAsync: jest.fn(() => Promise.resolve('key')), // eslint-disable-line no-undef
  getAttestationCertificateChainAsync: jest.fn(() => Promise.resolve(['key', 'key2'])), // eslint-disable-line no-undef
  isSupported: jest.fn(() => Promise.resolve(true)), // eslint-disable-line no-undef
}