import {
  CredentialExchangeRecord as CredentialRecord,
  CredentialState,
  ProofExchangeRecord,
  ProofState,
} from '@aries-framework/core'
import { useCredentialByState, useProofByState } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'

// eslint-disable-next-line import/no-named-as-default
import { ConfigurationContext } from '../../App/contexts/configuration'
import Home from '../../App/screens/Home'
import { testIdWithKey } from '../../App/utils/testable'
import configurationContext from '../contexts/configuration'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('displays a home screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // eslint-disable-next-line import/no-named-as-default-member
    React.useState = jest.fn().mockReturnValue([false, jest.fn()])
  })

  test('renders correctly', () => {
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <Home route={{} as any} navigation={useNavigation()} />
      </ConfigurationContext.Provider>
    )

    expect(tree).toMatchSnapshot()
  })

  /**
   * Scenario: Home Screen without any pending notification
   * Given wallet has successfully loaded
   * When the holder selects the "Home" button in the main navigation bar
   * Then the Home Screen is displayed
   * TODO:(jl) Good enough to be captured by the snapshot?
   */
  test('defaults to no notifications', async () => {
    const { findByText } = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <Home route={{} as any} navigation={useNavigation()} />
      </ConfigurationContext.Provider>
    )
    const notificationLabel = await findByText('Home.NoNewUpdates')

    expect(notificationLabel).toBeTruthy()
  })
})

describe('with a notifications module, when an issuer sends a credential offer', () => {
  const testCredentialRecords: CredentialRecord[] = [
    new CredentialRecord({
      threadId: '1',
      state: CredentialState.OfferReceived,
      protocolVersion: 'v1',
    }),
  ]
  const testProofRecords: ProofExchangeRecord[] = [
    new ProofExchangeRecord({
      threadId: '2',
      state: ProofState.RequestReceived,
      protocolVersion: 'v1',
    }),
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // eslint-disable-next-line import/no-named-as-default-member
    React.useState = jest.fn().mockReturnValue([false, jest.fn()])
    // @ts-ignore
    useCredentialByState.mockReturnValue(testCredentialRecords)
    // @ts-ignore
    useProofByState.mockReturnValue(testProofRecords)
  })

  /**
   * Scenario: Home Screen with pending notifications
   * Given Wallet has successfully loaded
   * When the Home Screen successfully loads
   * Then the number of pending notifications is displayed in the "Home" button in the main navigation bar
   */
  test('notification label is displayed with number of notifications', async () => {
    const { findByText } = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <Home route={{} as any} navigation={useNavigation()} />
      </ConfigurationContext.Provider>
    )
    const notificationLabel = await findByText('Home.Notifications (2)')

    expect(notificationLabel).toBeTruthy()
  })

  test('Pressing the "See All" button navigates correctly', async () => {
    const navigation = useNavigation()
    const { findByText } = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <Home route={{} as any} navigation={useNavigation()} />
      </ConfigurationContext.Provider>
    )
    const seeAllButton = await findByText('Home.SeeAll')

    expect(seeAllButton).toBeTruthy()

    act(() => {
      fireEvent(seeAllButton, 'press')
    })

    expect(navigation.navigate).toBeCalledWith('Notifications')
  })

  /**
   * Scenario: Holder receives a credential offer
   * Given the holder has a connection with an issuer
   * When the issuer sends a credential offer
   * Then the credential offer will arrive in the form of a notification in the home screen
   */
  test('notifications are displayed', async () => {
    const { findAllByTestId } = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <Home route={{} as any} navigation={useNavigation()} />
      </ConfigurationContext.Provider>
    )

    const flatListInstance = await findAllByTestId(testIdWithKey('NotificationListItem'))

    expect(flatListInstance).toHaveLength(2)
  })

  /**
   * Scenario: Holder selects a credential offer
   * Given the holder has received a credential offer from a connected issuer
   * When the holder selects the credential offer
   * When the holder is taken to the credential offer screen/flow
   */
  test('touch notification triggers navigation correctly I', async () => {
    const { findByTestId } = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <Home route={{} as any} navigation={useNavigation()} />
      </ConfigurationContext.Provider>
    )

    const button = await findByTestId(testIdWithKey('ViewOffer'))
    const navigation = useNavigation()

    expect(button).toBeDefined()

    act(() => {
      fireEvent(button, 'press')
    })

    expect(navigation.navigate).toHaveBeenCalledTimes(1)
    expect(navigation.navigate).toHaveBeenCalledWith('Notifications Stack', {
      screen: 'Credential Offer',
      params: { credentialId: testCredentialRecords[0].id },
    })
  })

  /**
   * Scenario: Holder selects a proof request
   * Given the holder has received a proof request from a connected verifier
   * When the holder selects the proof request
   * When the holder is taken to the proof request screen/flow
   */
  test('touch notification triggers navigation correctly II', async () => {
    const { findByTestId } = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <Home route={{} as any} navigation={useNavigation()} />
      </ConfigurationContext.Provider>
    )

    const button = await findByTestId(testIdWithKey('ViewProofRecord'))
    const navigation = useNavigation()

    expect(button).toBeDefined()

    act(() => {
      fireEvent(button, 'press')
    })

    expect(navigation.navigate).toHaveBeenCalledTimes(1)
    expect(navigation.navigate).toHaveBeenCalledWith('Notifications Stack', {
      screen: 'Proof Request',
      params: { proofId: testProofRecords[0].id },
    })
  })
})
