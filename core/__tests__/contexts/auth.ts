const authContext = {
  getWalletCredentials: jest.fn(),
  removeSavedWalletSecret: jest.fn(),
  checkPIN: jest.fn(),
  commitPIN: jest.fn(),
  setPIN: jest.fn(),
  isBiometricsActive: jest.fn(),
  disableBiometrics: jest.fn(),
}

export default authContext
