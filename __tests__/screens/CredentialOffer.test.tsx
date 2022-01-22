import { cleanup } from '@testing-library/react-native'

describe('displays a credential offer screen', () => {
  afterEach(() => {
    cleanup()
  })

  describe('with a credential offer', () => {
    /**
     * Scenario: Holder accepts a credential offer
     * Given the holder selects a credential offer
     * When the holder accepts the credential offer
     * Then the holder will be taken to a loading screen that informs them that their credential is coming
     */
    test('a loading screen is displayed when the user accepts the credential offer', () => {
      // TODO:
    })

    /**
     * Given the holder accepts a credential offer from an issuer they are connected with
     * When the credential arrives in the wallet
     * Then the screen will change from the loading screen to a success screen informing the holder that the credential has arrived
     */
    test('a success screen is displayed when the credential arrives', () => {
      // TODO:
    })

    /**
     * Given the holder accepts a credential offer from an issuer they are connected with
     * And the credential arrives in the wallet
     * And a success screen is displayed informing the holder that the credential has arrived
     * When the user presses the continue button
     * Then the holder will be taken to the credential list with the offered credential at the top of the list
     */
    test('pressing the continue button on the success screen takes the holder to the credential list screen', () => {
      // TODO:
    })
  })
})
