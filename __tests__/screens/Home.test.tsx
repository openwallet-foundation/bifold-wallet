import { CredentialRecord, CredentialState, ProofRecord, ProofState } from '@aries-framework/core'
import { useCredentialByState, useProofByState } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { FlatList } from 'react-native'
import { create } from 'react-test-renderer'

import Home from '../../App/screens/Home'

import { Button, InfoTextBox, NotificationListItem } from 'components'
import { NotificationType } from 'components/listItems/NotificationListItem'

describe('displays a home screen', () => {
  it('renders correctly', () => {
    const tree = create(<Home navigation={useNavigation()} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  // TODO:(jl) Good enough to be captured by the snapshot?
  it('defaults to no notifications', () => {
    const tree = create(<Home navigation={useNavigation()} />)
    const root = tree.root
    const results = root.findByType(InfoTextBox)

    expect(results.props.children).toBe('Home.NoNewUpdates')
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
    // @ts-ignore
    useCredentialByState.mockReturnValue(testCredentialRecords)
    // @ts-ignore
    useProofByState.mockReturnValue(testProofRecords)
  })

  /**
   * Scenario: Holder receives a credential offer
   * Given the holder has a connection with an issuer
   * When the issuer sends a credential offer
   * Then the credential offer will arrive in the form of a notification in the home screen
   */
  it('notifications are displayed', () => {
    const tree = create(<Home navigation={useNavigation()} />)
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
    const tree = create(<Home navigation={useNavigation()} />)
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
    expect(navigation.navigate).toHaveBeenCalledWith('Credential Offer', { credentialId: testCredentialRecords[0].id })
  })

  /**
   * Scenario: Holder selects a proof request
   * Given the holder has received a proof request from a connected verifier
   * When the holder selects the proof request
   * When the holder is taken to the proof request screen/flow
   */
  it('touch notification triggers navigation correctly', async () => {
    const tree = create(<Home navigation={useNavigation()} />)
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
    expect(navigation.navigate).toHaveBeenCalledWith('Proof Request', { proofId: testProofRecords[0].id })
  })
})
