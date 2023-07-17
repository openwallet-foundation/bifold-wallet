/* eslint-disable @typescript-eslint/no-explicit-any */
import { useConnectionById } from '@aries-framework/react-hooks'
import { render, waitFor } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import { ConfigurationContext } from '../../App/contexts/configuration'
import { useNotifications } from '../../App/hooks/notifications'
import ConnectionModal from '../../App/screens/Connection'
import configurationContext from '../contexts/configuration'
import navigationContext from '../contexts/navigation'
import timeTravel from '../helpers/timetravel'
import { useOutOfBandByConnectionId } from '../../App/hooks/connections'

const proofNotifPath = path.join(__dirname, '../fixtures/proof-notif.json')
const proofNotif = JSON.parse(fs.readFileSync(proofNotifPath, 'utf8'))
const connectionPath = path.join(__dirname, '../fixtures/connection-v1.json')
const connection = JSON.parse(fs.readFileSync(connectionPath, 'utf8'))

jest.useFakeTimers('legacy')
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
const props = { params: { connectionId: '123' } }

describe('ConnectionModal Component', () => {
  beforeEach(() => {
    // @ts-ignore-next-line
    useNotifications.mockReturnValue({ total: 0, notifications: [] })
    // @ts-ignore-next-line
    useOutOfBandByConnectionId.mockReturnValue({ outOfBandInvitation: { goalCode: "aries.vc.verify.once" } })
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  test('Renders correctly', async () => {
    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={navigationContext} route={props as any} />
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
        <ConnectionModal navigation={navigationContext} route={props as any} />
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
        <ConnectionModal navigation={navigationContext} route={props as any} />
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
    useOutOfBandByConnectionId.mockReturnValueOnce({ outOfBandInvitation: { goalCode: "aries.vc.verify.once" } })
    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={navigationContext} route={props as any} />
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
    useOutOfBandByConnectionId.mockReturnValueOnce({ outOfBandInvitation: { goalCode: "aries.vc.verify.once" } })
    const element = (
      <ConfigurationContext.Provider value={config}>
        <ConnectionModal navigation={navigationContext} route={props as any} />
      </ConfigurationContext.Provider>
    )

    const tree = render(element)

    await waitFor(() => {
      timeTravel(15000)
    })

    expect(tree).toMatchSnapshot()
  })
})
