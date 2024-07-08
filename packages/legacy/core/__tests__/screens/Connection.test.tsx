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
const connectionPath = path.join(__dirname, '../fixtures/connection-v1.json')
const connection = JSON.parse(fs.readFileSync(connectionPath, 'utf8'))
const connectionResponseReceivedPath = path.join(__dirname, '../fixtures/connection-v1-response-received.json')
const connectionResponseReceived = JSON.parse(fs.readFileSync(connectionResponseReceivedPath, 'utf8'))
const outOfBandInvitation = { goalCode: 'aries.vc.verify.once' }
const props = { params: { connectionId: connection.id } }

jest.useFakeTimers({ legacyFakeTimers: true })
jest.spyOn(global, 'setTimeout')
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

describe('ConnectionModal Component', () => {
  beforeEach(() => {
    // @ts-ignore-next-line
    useNotifications.mockReturnValue({ total: 0, notifications: [] })
    // @ts-ignore-next-line
    useOutOfBandByConnectionId.mockReturnValue({ outOfBandInvitation: { goalCode: 'aries.vc.verify.once' } })
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

  test('Test goal code loading screen', async () => {
    // @ts-ignore-next-line
    useOutOfBandByConnectionId.mockReturnValueOnce({ outOfBandInvitation: { goalCode: 'aries.vc.verify.once' } })
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

  test('Test goal code loading screen auto navigate', async () => {
    const config = configurationContext
    configurationContext.autoRedirectConnectionToHome = true
    // @ts-ignore-next-line
    useOutOfBandByConnectionId.mockReturnValueOnce({ outOfBandInvitation: { goalCode: 'aries.vc.verify.once' } })
    const element = (
      <ConfigurationContext.Provider value={config}>
        <ConnectionModal navigation={useNavigation()} route={props as any} />
      </ConfigurationContext.Provider>
    )

    const tree = render(element)

    await waitFor(() => {
      timeTravel(15000)
    })

    expect(tree).toMatchSnapshot()
  })

  test('Connection with no goal code, request-sent state', async () => {
    const navigation = useNavigation()
    // @ts-ignore-next-line
    useNotifications.mockReturnValue({ total: 1, notifications: [proofNotif] })
    // @ts-ignore-next-line
    useOutOfBandByConnectionId.mockReturnValue({ outOfBandInvitation: {} })
    // @ts-ignore-next-line
    useConnectionById.mockReturnValue(connection)
    // @ts-ignore-next-line
    useProofById.mockReturnValue(proofNotif)
    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={useNavigation()} route={props as any} />
      </ConfigurationContext.Provider>
    )

    const tree = render(element)

    expect(tree).toMatchSnapshot()
    expect(navigation.getParent()?.dispatch).not.toBeCalled()
  })

  test('Connection with no goal code, response-received state', async () => {
    const navigation = useNavigation()
    // @ts-ignore-next-line
    useNotifications.mockReturnValue({ total: 1, notifications: [proofNotif] })
    // @ts-ignore-next-line
    useOutOfBandByConnectionId.mockReturnValue({ outOfBandInvitation: {} })
    // @ts-ignore-next-line
    useConnectionById.mockReturnValue(connectionResponseReceived)
    // @ts-ignore-next-line
    useProofById.mockReturnValue(proofNotif)
    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={useNavigation()} route={props as any} />
      </ConfigurationContext.Provider>
    )

    const tree = render(element)

    expect(tree).toMatchSnapshot()
    expect(navigation.getParent()?.dispatch).toBeCalledTimes(1)
    expect(CommonActions.reset).toBeCalledWith({
      index: 1,
      routes: [{ name: 'Tab Stack' }, { name: 'Chat', params: { connectionId: connectionResponseReceived.id } }],
    })
  })

  test('No connection proof request auto navigate', async () => {
    const parentThreadId = 'abc123'
    const navigation = useNavigation<StackNavigationProp<DeliveryStackParams, Screens.Connection>>()
    // @ts-ignore-next-line
    useNotifications.mockReturnValue({ total: 1, notifications: [{ ...proofNotif, parentThreadId }] })
    // @ts-ignore-next-line
    useOutOfBandByConnectionId.mockReturnValue(undefined)
    // @ts-ignore-next-line
    useConnectionById.mockReturnValue(undefined)
    // @ts-ignore-next-line
    useProofById.mockReturnValue(proofNotif)

    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={useNavigation()} route={{ params: { threadId: parentThreadId } } as any} />
      </ConfigurationContext.Provider>
    )

    const tree = render(element)

    expect(tree).toMatchSnapshot()
    expect(navigation.replace).toBeCalledTimes(1)
    expect(navigation.replace).toBeCalledWith('Proof Request', { proofId: proofNotif.id })
  })

  test('Goal code extracted and navigation to Chat', async () => {
    const connectionId = 'abc123'
    const navigation = useNavigation()
    // @ts-ignore-next-line
    useNotifications.mockReturnValue({ total: 1, notifications: [proofNotif] })
    // @ts-ignore-next-line
    useOutOfBandByConnectionId.mockReturnValue({ outOfBandInvitation })
    // @ts-ignore-next-line
    useConnectionById.mockReturnValue(undefined)
    // @ts-ignore-next-line
    useProofById.mockReturnValue(proofNotif)

    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={useNavigation()} route={{ params: { connectionId } } as any} />
      </ConfigurationContext.Provider>
    )

    const tree = render(element)

    expect(tree).toMatchSnapshot()
    expect(navigation.navigate).toBeCalledTimes(1)
    expect(navigation.navigate).toBeCalledWith('Proof Request', { proofId: proofNotif.id })
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
})
