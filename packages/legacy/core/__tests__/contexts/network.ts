const networkContext = {
  assertNetworkConnected: jest.fn(),
  silentAssertConnectedNetwork: jest.fn(),
  displayNetInfoModal: jest.fn(),
  hideNetInfoModal: jest.fn(),
  assertInternetReachable: jest.fn(),
}

export default networkContext
