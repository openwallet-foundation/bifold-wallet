/* eslint-disable @typescript-eslint/no-explicit-any */
import { useConnectionById, useProofById } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { CommonActions } from '@react-navigation/native'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import { StackNavigationProp } from '@react-navigation/stack'
import { ConfigurationContext } from '../../App/contexts/configuration'
import { useOutOfBandByConnectionId } from '../../App/hooks/connections'
import { useNotifications } from '../../App/hooks/notifications'
import ConnectionModal from '../../App/screens/Connection'
import { DeliveryStackParams, Screens } from '../../App/types/navigators'
import { testIdWithKey } from '../../App/utils/testable'
import configurationContext from '../contexts/configuration'
import timeTravel from '../helpers/timetravel'

const proofNotifPath = path.join(__dirname, '../fixtures/proof-notif.json')
const proofNotif = JSON.parse(fs.readFileSync(proofNotifPath, 'utf8'))
const offerNotifPath = path.join(__dirname, '../fixtures/offer-notif.json')
const offerNotif = JSON.parse(fs.readFileSync(offerNotifPath, 'utf8'))
const connectionPath = path.join(__dirname, '../fixtures/connection-v1.json')
const connection = JSON.parse(fs.readFileSync(connectionPath, 'utf8'))
const connectionResponseReceivedPath = path.join(__dirname, '../fixtures/connection-v1-response-received.json')
const connectionResponseReceived = JSON.parse(fs.readFileSync(connectionResponseReceivedPath, 'utf8'))
const outOfBandInvitation = { goalCode: 'aries.vc.verify.once' }
const props = { params: { connectionId: connection.id } }

jest.useFakeTimers({ legacyFakeTimers: true })
jest.spyOn(global, 'setTimeout')
jest.mock('../../App/container-api')
jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

jest.mock('../../App/hooks/notifications', () => ({
  useNotifications: jest.fn(),
}))

jest.mock('../../App/hooks/connections', () => ({
  useOutOfBandByConnectionId: jest.fn(),
}))

describe('Connection Modal Component', () => {
  beforeEach(() => {
    // @ts-ignore-next-line
    useNotifications.mockReturnValue({ total: 0, notifications: [] })
    // @ts-ignore-next-line
    // useOutOfBandByConnectionId.mockReturnValue({ outOfBandInvitation: { goalCode: 'aries.vc.verify.once' } })
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  test('Renders correctly', async () => {
    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={useNavigation()} route={props as any} />
      </ConfigurationContext.Provider>
    )
    const tree = render(element)

    expect(tree).toMatchSnapshot()
  })

  test('Updates after delay', async () => {
    // @ts-ignore-next-line
    useConnectionById.mockReturnValueOnce(connection)
    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={useNavigation()} route={props as any} />
      </ConfigurationContext.Provider>
    )

    const tree = render(element)

    await waitFor(() => {
      timeTravel(10000)
    })

    expect(tree).toMatchSnapshot()
  })

  test('Dismiss on demand', async () => {
    // @ts-ignore-next-line
    useNotifications.mockReturnValueOnce({ total: 1, notifications: [proofNotif] })
    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={useNavigation()} route={props as any} />
      </ConfigurationContext.Provider>
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
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={useNavigation()} route={props as any} />
      </ConfigurationContext.Provider>
    )

    const { getByTestId } = render(element)
    const dismissButton = getByTestId(testIdWithKey('BackToHome'))
    fireEvent(dismissButton, 'press')

    expect(navigation.navigate).toBeCalledTimes(1)
    expect(navigation.navigate).toBeCalledWith('Tab Home Stack', { screen: 'Home' })
  })

  test('Connection, no goal code navigation to chat', async () => {
    const connectionId = 'abc123'
    const navigation = useNavigation()
    // @ts-ignore-next-line
    useNotifications.mockReturnValue({ total: 1, notifications: [{ ...offerNotif, connectionId }] })
    // @ts-ignore-next-line
    useConnectionById.mockReturnValue({ ...connection, id: connectionId, state: 'offer-received' })

    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={useNavigation()} route={{ params: { connectionId } } as any} />
      </ConfigurationContext.Provider>
    )

    const tree = render(element)

    expect(tree).toMatchSnapshot()
    expect(navigation.navigate).toBeCalledTimes(0)
    expect(navigation.getParent).toBeCalledTimes(1)
  })

  test('Valid goal code aries.vc.issue extracted, navigation to accept offer', async () => {
    const connectionId = 'abc123'
    const oobId = 'def456'
    const goalCode = 'aries.vc.issue'
    const navigation = useNavigation()
    // @ts-ignore-next-line
    useNotifications.mockReturnValue({ total: 1, notifications: [{ ...offerNotif, connectionId }] })
    // @ts-ignore-next-line
    useOutOfBandByConnectionId.mockReturnValue({ id: oobId, outOfBandInvitation: { goalCode } })
    // @ts-ignore-next-line
    useConnectionById.mockReturnValue({ ...connection, id: connectionId, outOfBandId: oobId, state: 'offer-received' })

    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={useNavigation()} route={{ params: { connectionId } } as any} />
      </ConfigurationContext.Provider>
    )

    const tree = render(element)

    expect(tree).toMatchSnapshot()
    expect(navigation.navigate).toBeCalledTimes(1)
    expect(navigation.navigate).toBeCalledWith('Credential Offer', {
      credentialId: offerNotif.id,
    })
  })

  test('Valid goal code aries.vc.verify extracted, navigation to proof request', async () => {
    const connectionId = 'abc123'
    const oobId = 'def456'
    const goalCode = 'aries.vc.verify'
    const navigation = useNavigation()
    // @ts-ignore-next-line
    useNotifications.mockReturnValue({ total: 1, notifications: [{ ...proofNotif, connectionId }] })
    // @ts-ignore-next-line
    useOutOfBandByConnectionId.mockReturnValue({ id: oobId, outOfBandInvitation: { goalCode } })
    // @ts-ignore-next-line
    useConnectionById.mockReturnValue({
      ...connection,
      id: connectionId,
      outOfBandId: oobId,
      state: 'request-received',
    })

    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={useNavigation()} route={{ params: { connectionId } } as any} />
      </ConfigurationContext.Provider>
    )

    const tree = render(element)

    expect(tree).toMatchSnapshot()
    expect(navigation.navigate).toBeCalledTimes(1)
    expect(navigation.navigate).toBeCalledWith('Proof Request', {
      proofId: proofNotif.id,
    })
  })

  test('Valid goal code aries.vc.verify extracted, navigation to proof request', async () => {
    const connectionId = 'abc123'
    const oobId = 'def456'
    const goalCode = 'aries.vc.verify.once'
    const navigation = useNavigation()
    // @ts-ignore-next-line
    useNotifications.mockReturnValue({ total: 1, notifications: [{ ...proofNotif, connectionId }] })
    // @ts-ignore-next-line
    useOutOfBandByConnectionId.mockReturnValue({ id: oobId, outOfBandInvitation: { goalCode } })
    // @ts-ignore-next-line
    useConnectionById.mockReturnValue({
      ...connection,
      id: connectionId,
      outOfBandId: oobId,
      state: 'request-received',
    })

    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={useNavigation()} route={{ params: { connectionId } } as any} />
      </ConfigurationContext.Provider>
    )

    const tree = render(element)

    expect(tree).toMatchSnapshot()
    expect(navigation.navigate).toBeCalledTimes(1)
    expect(navigation.navigate).toBeCalledWith('Proof Request', {
      proofId: proofNotif.id,
    })
  })

  test('Invalid goal code extracted, do nothing', async () => {
    const connectionId = 'abc123'
    const oobId = 'def456'
    const goalCode = 'aries.vc.happy-teapot'
    const navigation = useNavigation()
    // @ts-ignore-next-line
    useNotifications.mockReturnValue({ total: 1, notifications: [{ ...proofNotif, connectionId }] })
    // @ts-ignore-next-line
    useOutOfBandByConnectionId.mockReturnValue({ id: oobId, outOfBandInvitation: { goalCode } })
    // @ts-ignore-next-line
    useConnectionById.mockReturnValue({
      ...connection,
      id: connectionId,
      outOfBandId: oobId,
      state: 'request-received',
    })

    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={useNavigation()} route={{ params: { connectionId } } as any} />
      </ConfigurationContext.Provider>
    )

    const tree = render(element)

    await waitFor(() => {
      timeTravel(10000)
    })

    expect(tree).toMatchSnapshot()
    expect(navigation.navigate).toBeCalledTimes(0)
  })
})
