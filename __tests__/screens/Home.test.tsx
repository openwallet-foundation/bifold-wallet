import { CredentialRecord, CredentialState, ProofRecord } from '@aries-framework/core'
import { useCredentialByState, useProofByState } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { FlatList, TouchableOpacity } from 'react-native'
import { create } from 'react-test-renderer'

import Home from '../../App/screens/Home'

import { InfoTextBox, NotificationListItem } from 'components'

describe('displays a home screen', () => {
  it('renders correctly', () => {
    const tree = create(<Home />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  // TODO:(jl) Good enough to be captured by the snapshot?
  it('defaults to no notifications', () => {
    const tree = create(<Home />)
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
  const testProofRecords: ProofRecord[] = []

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
    const tree = create(<Home />)
    const root = tree.root
    const flatListInstance = root.findByType(FlatList)

    expect(flatListInstance.findAllByType(NotificationListItem)).toHaveLength(1)
  })

  /**
   * Scenario: Holder selects a credential offer
   * Given the holder has received a credential offer from a connected issuer
   * When the holder selects on the credential offer
   * When the holder is taken to the credential offer screen/flow
   */
  it('touch notification triggers navigation correctly', async () => {
    const tree = create(<Home />)
    const root = tree.root
    const touchable = root.findByType(NotificationListItem).findByType(TouchableOpacity)
    const navigation = useNavigation()

    touchable.props.onPress()

    expect(navigation.navigate).toHaveBeenCalledTimes(1)
    expect(navigation.navigate).toHaveBeenCalledWith('Credential Offer', { credentialId: testCredentialRecords[0].id })
  })
})
