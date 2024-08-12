const networkContext = {
  assertConnectedNetwork: jest.fn(),
  silentAssertConnectedNetwork: jest.fn(),
  displayNetInfoModal: jest.fn(),
  hideNetInfoModal: jest.fn(),
  assertLedgerConnectivity: jest.fn(),
  setLedgerNodes: jest.fn(),
}

export default networkContext
