const authContext = {
  getWalletSecret: jest.fn(),
  removeSavedWalletSecret: jest.fn(),
  checkWalletPIN: jest.fn(),
  commitWalletToKeychain: jest.fn(),
  setPIN: jest.fn(),
  isBiometricsActive: jest.fn(),
  disableBiometrics: jest.fn(),
  rekeyWallet: jest.fn(),
  verifyPIN: jest.fn(),
  lockOutUser: jest.fn(),
  pinAttempts: 0,
  resetPinAttempts: jest.fn(),
  maxPinAttempts: 3,
  shouldOfferMnemonicRecovery: false,
  recoverWithMnemonic: jest.fn(),
}

export default authContext
