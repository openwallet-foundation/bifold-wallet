import { CredentialRecord, CredentialState } from '@aries-framework/core'
import { useCredentialById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { cleanup, fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import CredentialOffer from '../../App/screens/CredentialOffer'

import Button from 'components/buttons/Button'
import NotificationModal from 'components/modals/NotificationModal'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

describe('displays a credential offer screen', () => {
  const testCredentialRecords: CredentialRecord[] = [
    new CredentialRecord({
      threadId: '1',
      state: CredentialState.OfferReceived,
    }),
  ]

  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    jest.clearAllMocks()

    testCredentialRecords[0].state = CredentialState.OfferReceived

    // @ts-ignore
    useCredentialById.mockReturnValue(testCredentialRecords[0])
  })

  describe('with a credential offer', () => {
    /**
     * Scenario: Holder accepts a credential offer
     * Given the holder selects a credential offer
     * When the holder accepts the credential offer
     * Then the holder will be taken to a loading screen that informs them that their credential is coming
     */
    test('a loading screen is displayed when the user accepts the credential offer', async () => {
      const { findByText, UNSAFE_getByProps } = render(
        <CredentialOffer
          navigation={useNavigation()}
          route={{ params: { credentialId: testCredentialRecords[0].id } } as any}
        />
      )

      const acceptButtonInstance = await findByText('Global.Accept')

      fireEvent(acceptButtonInstance, 'press')

      const notificationModalInstance = await UNSAFE_getByProps({
        title: 'CredentialOffer.CredentialOnTheWay',
      })

      expect(notificationModalInstance).not.toBe(null)
      expect(notificationModalInstance.type).toBe(NotificationModal)
      expect(notificationModalInstance.props.visible).toBeTruthy()
    })

    /**
     * Given the holder accepts a credential offer from an issuer they are connected with
     * When the credential arrives in the wallet
     * Then the screen will change from the loading screen to a success screen informing the holder that the credential has arrived
     */
    test('a success screen is displayed when the credential arrives', async () => {
      testCredentialRecords[0].state = CredentialState.CredentialReceived

      const { findByText, UNSAFE_getByProps } = render(
        <CredentialOffer
          navigation={useNavigation()}
          route={{ params: { credentialId: testCredentialRecords[0].id } } as any}
        />
      )

      const acceptButtonInstance = await findByText('Global.Accept')

      fireEvent(acceptButtonInstance, 'press')

      const notificationModalInstance = await UNSAFE_getByProps({
        title: 'CredentialOffer.CredentialAddedToYourWallet',
      })

      expect(notificationModalInstance).not.toBe(null)
      expect(notificationModalInstance.type).toBe(NotificationModal)
      expect(notificationModalInstance.props.visible).toBeTruthy()
    })

    /**
     * Given the holder accepts a credential offer from an issuer they are connected with
     * And the credential arrives in the wallet
     * And a success screen is displayed informing the holder that the credential has arrived
     * When the user presses the continue button
     * Then the holder will be taken to the credential list with the offered credential at the top of the list
     */
    test('pressing the continue button on the success screen takes the holder to the credential list screen', async () => {
      const navigation = useNavigation()
      testCredentialRecords[0].state = CredentialState.CredentialReceived

      const { findByText, UNSAFE_getByProps } = render(
        <CredentialOffer
          navigation={useNavigation()}
          route={{ params: { credentialId: testCredentialRecords[0].id } } as any}
        />
      )

      const acceptButtonInstance = await findByText('Global.Accept')

      fireEvent(acceptButtonInstance, 'press')

      const notificationModalInstance = await UNSAFE_getByProps({
        title: 'CredentialOffer.CredentialAddedToYourWallet',
      })
      const notificationModalDoneButtonInstance = notificationModalInstance.findByProps({ title: 'Global.Done' })

      expect(notificationModalDoneButtonInstance).not.toBe(null)
      expect(notificationModalDoneButtonInstance.type).toBe(Button)

      fireEvent(notificationModalDoneButtonInstance, 'press')

      expect(navigation.navigate).toBeCalledWith('Credentials Stack')
    })
  })
})
