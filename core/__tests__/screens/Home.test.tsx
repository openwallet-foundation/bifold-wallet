import {
  CredentialExchangeRecord as CredentialRecord,
  CredentialState,
  ProofRecord,
  ProofState,
} from '@aries-framework/core'
import { useCredentialByState, useProofByState } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { FlatList } from 'react-native'
import { create } from 'react-test-renderer'

import { Button, NotificationListItem } from '../../App/components'
import { NotificationType } from '../../App/components/listItems/NotificationListItem'
import HomeContentView from '../../App/components/views/HomeContentView'
import { ConfigurationContext, ConfigurationProvider } from '../../App/contexts/configuration'
import Home from '../../App/screens/Home'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

const defaultConfiguration: ConfigurationContext = {
  pages: undefined,
  splash: undefined,
  terms: undefined,
  homeContentView: HomeContentView,
}

describe('displays a home screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    React.useState = jest.fn().mockReturnValue([false, jest.fn()])
  })

  it('renders correctly', () => {
    const tree = create(
      <ConfigurationProvider value={defaultConfiguration}>
        <Home navigation={useNavigation()} />
      </ConfigurationProvider>
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  /**
   * Scenario: Home Screen without any pending notification
   * Given wallet has successfully loaded
   * When the holder selects the "Home" button in the main navigation bar
   * Then the Home Screen is displayed
   * TODO:(jl) Good enough to be captured by the snapshot?
   */
  it('defaults to no notifications', async () => {
    const { findByText } = render(
      <ConfigurationProvider value={defaultConfiguration}>
        <Home navigation={useNavigation()} />
      </ConfigurationProvider>
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
    }),
  ]
  const testProofRecords: ProofRecord[] = [
    new ProofRecord({
      threadId: '2',
      state: ProofState.RequestReceived,
    }),
  ]

  beforeEach(() => {
    jest.clearAllMocks()
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
  it('notification label is displayed with number of notifications', async () => {
    const { findByText } = render(
      <ConfigurationProvider value={defaultConfiguration}>
        <Home navigation={useNavigation()} />
      </ConfigurationProvider>
    )
    const notificationLabel = await findByText('Home.Notifications (2)')

    expect(notificationLabel).toBeTruthy()
  })

  it('Pressing the "See All" button navigates correctly', async () => {
    const navigation = useNavigation()
    const { findByText } = render(
      <ConfigurationProvider value={defaultConfiguration}>
        <Home navigation={useNavigation()} />
      </ConfigurationProvider>
    )
    const seeAllButton = await findByText('Home.SeeAll')

    expect(seeAllButton).toBeTruthy()

    fireEvent(seeAllButton, 'press')

    expect(navigation.navigate).toBeCalledWith('Notifications')
  })

  /**
   * Scenario: Holder receives a credential offer
   * Given the holder has a connection with an issuer
   * When the issuer sends a credential offer
   * Then the credential offer will arrive in the form of a notification in the home screen
   */
  it('notifications are displayed', () => {
    const tree = create(
      <ConfigurationProvider value={defaultConfiguration}>
        <Home navigation={useNavigation()} />
      </ConfigurationProvider>
    )
    const root = tree.root
    const flatListInstance = root.findByType(FlatList)

    expect(flatListInstance.findAllByType(NotificationListItem)).toHaveLength(2)
  })

  /**
   * Scenario: Holder selects a credential offer
   * Given the holder has received a credential offer from a connected issuer
   * When the holder selects the credential offer
   * When the holder is taken to the credential offer screen/flow
   */
  it('touch notification triggers navigation correctly', async () => {
    const tree = create(
      <ConfigurationProvider value={defaultConfiguration}>
        <Home navigation={useNavigation()} />
      </ConfigurationProvider>
    )
    const root = tree.root
    const notifications = root.findAllByType(NotificationListItem)
    const credentialOffer = notifications.find(
      (notification) => !!(notification.props.notificationType === NotificationType.CredentialOffer)
    )
    const button = credentialOffer?.findByType(Button)
    const navigation = useNavigation()

    expect(button).toBeDefined()

    button?.props.onPress()

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
  it('touch notification triggers navigation correctly', async () => {
    const tree = create(
      <ConfigurationProvider value={defaultConfiguration}>
        <Home navigation={useNavigation()} />
      </ConfigurationProvider>
    )
    const root = tree.root
    const notifications = root.findAllByType(NotificationListItem)
    const proofRequest = notifications.find(
      (notification) => !!(notification.props.notificationType === NotificationType.ProofRequest)
    )
    const button = proofRequest?.findByType(Button)
    const navigation = useNavigation()

    expect(button).toBeDefined()

    button?.props.onPress()

    expect(navigation.navigate).toHaveBeenCalledTimes(1)
    expect(navigation.navigate).toHaveBeenCalledWith('Notifications Stack', {
      screen: 'Proof Request',
      params: { proofId: testProofRecords[0].id },
    })
  })
})
