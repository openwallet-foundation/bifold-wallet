const authContext = {
  getWalletSecret: jest.fn(),
  removeSavedWalletSecret: jest.fn(),
  checkWalletPIN: jest.fn(),
  commitWalletToKeychain: jest.fn(),
  setPIN: jest.fn(),
  isBiometricsActive: jest.fn(),
  disableBiometrics: jest.fn(),
  rekeyWallet: jest.fn(),
  lockOutUser: jest.fn(),
}

export default authContext
