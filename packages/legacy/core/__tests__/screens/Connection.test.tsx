/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigation } from '@react-navigation/native'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import { useOutOfBandById, useConnectionByOutOfBandId } from '../../App/hooks/connections'
import ConnectionModal from '../../App/screens/Connection'
import { testIdWithKey } from '../../App/utils/testable'
import timeTravel from '../helpers/timetravel'
import { useProofByState } from '../../__mocks__/@credo-ts/react-hooks'
import { BasicAppContext } from '../helpers/app'

const oobRecordPath = path.join(__dirname, '../fixtures/oob-record.json')
const oobRecord = JSON.parse(fs.readFileSync(oobRecordPath, 'utf8'))
const proofNotifPath = path.join(__dirname, '../fixtures/proof-notif.json')
const proofNotif = JSON.parse(fs.readFileSync(proofNotifPath, 'utf8'))
const offerNotifPath = path.join(__dirname, '../fixtures/offer-notif.json')
const offerNotif = JSON.parse(fs.readFileSync(offerNotifPath, 'utf8'))
const connectionPath = path.join(__dirname, '../fixtures/connection-v1.json')
const connection = JSON.parse(fs.readFileSync(connectionPath, 'utf8'))
const props = { params: { oobRecordId: connection.id } }

jest.useFakeTimers({ legacyFakeTimers: true })
jest.spyOn(global, 'setTimeout')


jest.mock('../../App/hooks/connections', () => ({
  useOutOfBandByConnectionId: jest.fn(),
  useConnectionByOutOfBandId: jest.fn(),
  useOutOfBandById: jest.fn(),
}))

describe('Connection Modal Component', () => {
  beforeEach(() => {
    useProofByState.mockReturnValue([proofNotif])
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  test('Renders correctly', async () => {
    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={props as any} />
      </BasicAppContext>
    )
    const tree = render(element)

    expect(tree).toMatchSnapshot()
  })

  test('Updates after delay', async () => {
    // @ts-ignore-next-line
    useConnectionByOutOfBandId.mockReturnValueOnce(connection)
    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={props as any} />
      </BasicAppContext>
    )

    const tree = render(element)

    await waitFor(() => {
      timeTravel(10000)
    })

    expect(tree).toMatchSnapshot()
  })

  test('Dismiss on demand', async () => {
    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={props as any} />
      </BasicAppContext>
    )

    const tree = render(element)

    await waitFor(() => {
      timeTravel(10000)
    })

    expect(tree).toMatchSnapshot()
  })

  test('Dismiss navigates Home', async () => {
    const navigation = useNavigation()
    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={props as any} />
      </BasicAppContext>
    )

    const { getByTestId } = render(element)
    const dismissButton = getByTestId(testIdWithKey('BackToHome'))
    fireEvent(dismissButton, 'press')

    expect(navigation.navigate).toBeCalledTimes(1)
    expect(navigation.navigate).toBeCalledWith('Tab Home Stack', { screen: 'Home' })
  })

  test('No connection, navigation to proof', async () => {
    const threadId = 'qrf123'
    const navigation = useNavigation()
    // @ts-ignore-next-line
    useOutOfBandById.mockReturnValue({
      ...oobRecord,
      getTags: () => ({ ...oobRecord._tags, invitationRequestsThreadIds: [threadId] }),
    })
    useProofByState.mockReturnValue([{ ...proofNotif, threadId }])

    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={{ params: { oobRecordId: oobRecord.id } } as any} />
      </BasicAppContext>
    )

    const tree = render(element)

    expect(tree).toMatchSnapshot()
    // @ts-ignore-next-line
    expect(navigation.replace).toBeCalledTimes(1)
    // @ts-ignore-next-line
    expect(navigation.replace).toBeCalledWith('Proof Request', {
      proofId: proofNotif.id,
    })
  })

  test('Connection, no goal code navigation to chat', async () => {
    const threadId = 'qrf123'
    const connectionId = 'abc123'
    const navigation = useNavigation()
    // @ts-ignore-next-line
    useOutOfBandById.mockReturnValue({
      ...oobRecord,
      getTags: () => ({ ...oobRecord._tags, invitationRequestsThreadIds: [threadId] }),
    })
    useProofByState.mockReturnValue([{ ...proofNotif, threadId }])
    // @ts-ignore-next-line
    useConnectionByOutOfBandId.mockReturnValue({ ...connection, id: connectionId, state: 'offer-received' })

    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={{ params: { oobRecordId: oobRecord.id } } as any} />
      </BasicAppContext>
    )

    const tree = render(element)

    expect(tree).toMatchSnapshot()
    expect(navigation.navigate).toBeCalledTimes(0)
    expect(navigation.getParent()?.dispatch).toBeCalledTimes(1)
  })

  test('Valid goal code aries.vc.issue extracted, navigation to accept offer', async () => {
    const oobRecordId = 'def456'
    const goalCode = 'aries.vc.issue'
    const threadId = 'qrf123'
    const connectionId = 'abc123'
    const navigation = useNavigation()
    // @ts-ignore-next-line
    useOutOfBandById.mockReturnValue({
      ...oobRecord,
      getTags: () => ({ ...oobRecord._tags, invitationRequestsThreadIds: [threadId] }),
      outOfBandInvitation: { ...oobRecord.outOfBandInvitation, goalCode },
    })
    // @ts-ignore-next-lin
    useConnectionByOutOfBandId.mockReturnValue({ ...connection, id: connectionId, state: 'offer-received' })

    useProofByState.mockReturnValue([{ ...offerNotif, threadId }])

    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={{ params: { oobRecordId } } as any} />
      </BasicAppContext>
    )

    const tree = render(element)

    expect(tree).toMatchSnapshot()
    expect(navigation.navigate).toBeCalledTimes(0)
    // @ts-ignore-next-lin
    expect(navigation.replace).toBeCalledWith('Credential Offer', {
      credentialId: offerNotif.id,
    })
  })

  test('Valid goal code aries.vc.verify extracted, navigation to proof request', async () => {
    const oobRecordId = 'def456'
    const goalCode = 'aries.vc.verify'
    const threadId = 'qrf123'
    const connectionId = 'abc123'
    const navigation = useNavigation()
    // @ts-ignore-next-line
    useOutOfBandById.mockReturnValue({
      ...oobRecord,
      getTags: () => ({ ...oobRecord._tags, invitationRequestsThreadIds: [threadId] }),
      outOfBandInvitation: { ...oobRecord.outOfBandInvitation, goalCode },
    })
    // @ts-ignore-next-lin
    useConnectionByOutOfBandId.mockReturnValue({ ...connection, id: connectionId, state: 'offer-received' })
    useProofByState.mockReturnValue([{ ...proofNotif, threadId }])

    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={{ params: { oobRecordId } } as any} />
      </BasicAppContext>
    )

    const tree = render(element)

    expect(tree).toMatchSnapshot()
    expect(navigation.navigate).toBeCalledTimes(0)
    // @ts-ignore-next-lin
    expect(navigation.replace).toBeCalledWith('Proof Request', {
      proofId: proofNotif.id,
    })
  })

  test('Valid goal code aries.vc.verify.once extracted, navigation to proof request', async () => {
    const oobRecordId = 'def456'
    const goalCode = 'aries.vc.verify.once'
    const threadId = 'qrf123'
    const connectionId = 'abc123'
    const navigation = useNavigation()
    // @ts-ignore-next-line
    useOutOfBandById.mockReturnValue({
      ...oobRecord,
      getTags: () => ({ ...oobRecord._tags, invitationRequestsThreadIds: [threadId] }),
      outOfBandInvitation: { ...oobRecord.outOfBandInvitation, goalCode },
    })
    // @ts-ignore-next-lin
    useConnectionByOutOfBandId.mockReturnValue({ ...connection, id: connectionId, state: 'offer-received' })
    // @ts-ignore-next-line
    useProofByState.mockReturnValue([{ ...proofNotif, threadId }])
    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={{ params: { oobRecordId } } as any} />
      </BasicAppContext>
    )

    const tree = render(element)

    expect(tree).toMatchSnapshot()
    expect(navigation.navigate).toBeCalledTimes(0)
    // @ts-ignore-next-lin
    expect(navigation.replace).toBeCalledWith('Proof Request', {
      proofId: proofNotif.id,
    })
  })

  test('Invalid goal code extracted, do nothing', async () => {
    const oobRecordId = 'def456'
    const goalCode = 'aries.vc.happy-teapot'
    const threadId = 'qrf123'
    const connectionId = 'abc123'
    const navigation = useNavigation()
    // @ts-ignore-next-line
    useOutOfBandById.mockReturnValue({
      ...oobRecord,
      getTags: () => ({ ...oobRecord._tags, invitationRequestsThreadIds: [threadId] }),
      outOfBandInvitation: { ...oobRecord.outOfBandInvitation, goalCode },
    })
    // @ts-ignore-next-lin
    useConnectionByOutOfBandId.mockReturnValue({ ...connection, id: connectionId, state: 'offer-received' })
    // @ts-ignore-next-line
    useProofByState.mockReturnValue([{ ...proofNotif, threadId, state: 'request-received' }])


    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={{ params: { oobRecordId } } as any} />
      </BasicAppContext>
    )

    const tree = render(element)

    await waitFor(() => {
      timeTravel(10000)
    })

    expect(tree).toMatchSnapshot()
    expect(navigation.navigate).toBeCalledTimes(0)
    expect(navigation.getParent()?.dispatch).toBeCalledTimes(1)
  })
})
