import {
  BasicMessageRecord,
  BasicMessageRole,
  CredentialExchangeRecord as CredentialRecord,
  CredentialRole,
  CredentialState,
  ProofExchangeRecord,
  ProofRole,
  ProofState,
} from '@credo-ts/core'
import { useNavigation } from '@react-navigation/native'
import { act, fireEvent, render } from '@testing-library/react-native'

// import { useAgent } from '@credo-ts/react-hooks'

import React from 'react'

// eslint-disable-next-line import/no-named-as-default
import Home from '../../App/screens/Home'
import { testIdWithKey } from '../../App/utils/testable'
import { BasicAppContext } from '../helpers/app'
import { useProofByState, useBasicMessages, useConnectionById, useCredentialByState, useAgent } from '../../__mocks__/@credo-ts/react-hooks'

describe('displays a home screen', () => {
  beforeEach(() => { })

  test('renders correctly', () => {
    const tree = render(
      <BasicAppContext>
        <Home route={{} as any} navigation={useNavigation()} />
      </BasicAppContext>
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
      <BasicAppContext>
        <Home route={{} as any} navigation={useNavigation()} />
      </BasicAppContext>
    )
    const notificationLabel = await findByText('Home.NoNewUpdates')

    expect(notificationLabel).toBeTruthy()
  })
})

describe('with a notifications module, when an issuer sends a credential offer', () => {
  const testCredentialRecords: CredentialRecord[] = [
    new CredentialRecord({
      role: CredentialRole.Holder,
      threadId: '1',
      state: CredentialState.OfferReceived,
      protocolVersion: 'v1',
    }),
  ]
  const testProofRecords: ProofExchangeRecord[] = [
    new ProofExchangeRecord({
      role: ProofRole.Prover,
      threadId: '2',
      state: ProofState.RequestReceived,
      protocolVersion: 'v1',
    }),
    new ProofExchangeRecord({
      role: ProofRole.Prover,
      threadId: '3',
      state: ProofState.Done,
      protocolVersion: 'v1',
    }),
  ]
  const testBasicMessages: BasicMessageRecord[] = [
    new BasicMessageRecord({
      threadId: '1',
      connectionId: '1',
      role: BasicMessageRole.Receiver,
      content: 'Hello',
      sentTime: '20200303',
    }),
    new BasicMessageRecord({
      threadId: '2',
      connectionId: '1',
      role: BasicMessageRole.Receiver,
      content: 'Hi',
      sentTime: '20200303',
    }),
  ]

  beforeEach(() => {
    jest.resetAllMocks()
    useBasicMessages.mockReturnValue({ records: testBasicMessages })

    useProofByState.mockReturnValue(testProofRecords)
    useCredentialByState.mockReturnValue(testCredentialRecords)

    useAgent.mockReturnValue({})


    useConnectionById.mockReturnValue({ theirLabel: 'ACME' })
  })

  /**
   * Scenario: Holder receives a credential offer
   * Given the holder has a connection with an issuer
   * When the issuer sends a credential offer
   * Then the credential offer will arrive in the form of a notification in the home screen
   */
  test('notifications are displayed', async () => {
    const { findAllByTestId } = render(
      <BasicAppContext>
        <Home route={{} as any} navigation={useNavigation()} />
      </BasicAppContext>
    )

    const flatListInstance = await findAllByTestId(testIdWithKey('NotificationListItem'))

    expect(flatListInstance).toHaveLength(4)
  })

  /**
   * Scenario: Holder selects a credential offer
   * Given the holder has received a credential offer from a connected issuer
   * When the holder selects the credential offer
   * When the holder is taken to the credential offer screen/flow
   */
  test('touch notification triggers navigation correctly I', async () => {
    const navigation = useNavigation()
    const view = render(
      <BasicAppContext>
        <Home route={{} as any} navigation={useNavigation()} />
      </BasicAppContext>
    )

    const button = await view.findByTestId(testIdWithKey('ViewOffer'))

    expect(button).toBeDefined()
    //view.debug()
    await act(() => {
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
      <BasicAppContext>
        <Home route={{} as any} navigation={useNavigation()} />
      </BasicAppContext>
    )

    const button = await findByTestId(testIdWithKey('ViewProofRecord'))
    const navigation = useNavigation()

    expect(button).toBeDefined()

    await act(() => {
      fireEvent(button, 'press')
    })

    expect(navigation.navigate).toHaveBeenCalledTimes(1)

    expect(navigation.navigate).toHaveBeenCalledWith('Notifications Stack', {
      screen: 'Proof Request',
      params: { proofId: testProofRecords[0].id },
    })
  })

  /**
   * Scenario: Holder selects a proof request
   * Given the holder has received a proof request from a connected verifier
   * When the holder selects the proof request
   * When the holder is taken to the proof request screen/flow
   */
  test('touch notification triggers navigation correctly III', async () => {
    const { findByTestId } = render(
      <BasicAppContext>
        <Home route={{} as any} navigation={useNavigation()} />
      </BasicAppContext>
    )

    const button = await findByTestId(testIdWithKey('ViewProofRecordReceived'))
    const navigation = useNavigation()

    expect(button).toBeDefined()

    act(() => {
      fireEvent(button, 'press')
    })

    expect(navigation.navigate).toHaveBeenCalledTimes(1)
    expect(navigation.navigate).toHaveBeenCalledWith('Contacts Stack', {
      screen: 'Proof Details',
      params: { recordId: testProofRecords[1].id, isHistory: true },
    })
  })

  /**
   * Scenario: Holder selects a basic message notification
   * Given the holder has received a message from a contact
   * When the holder taps the View message button
   * The holder is taken to the chat screen for that contact
   */
  test('touch notification triggers navigation correctly IV', async () => {
    const { findAllByTestId } = render(
      <BasicAppContext>
        <Home route={{} as any} navigation={useNavigation()} />
      </BasicAppContext>
    )

    await act(async () => {
      const button = (await findAllByTestId(testIdWithKey('ViewBasicMessage')))[0]
      expect(button).toBeDefined()
      fireEvent(button, 'press')
    })

    //xxx
    const navigation = useNavigation()
    expect(navigation.getParent()?.navigate).toHaveBeenCalledTimes(1)
    expect(navigation.getParent()?.navigate).toHaveBeenCalledWith('Contacts Stack', {
      screen: 'Chat',
      params: { connectionId: '1' },
    })
  })
})
