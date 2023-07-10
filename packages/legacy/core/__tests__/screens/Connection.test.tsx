/* eslint-disable @typescript-eslint/no-explicit-any */
import { useConnectionById } from '@aries-framework/react-hooks'
import { render } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import { ConfigurationContext } from '../../App/contexts/configuration'
import { useNotifications } from '../../App/hooks/notifications'
import ConnectionModal from '../../App/screens/Connection'
import configurationContext from '../contexts/configuration'
import navigationContext from '../contexts/navigation'

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

const props = { params: { connectionId: '123' } }

describe('ConnectionModal Component', () => {
  beforeEach(() => {
    // @ts-ignore-next-line
    useNotifications.mockReturnValue({ total: 0, notifications: [] })
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

  test('Navigate to chat when connection present', async () => {
    // @ts-ignore-next-line
    useConnectionById.mockReturnValueOnce(connection)
    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={navigationContext} route={props as any} />
      </ConfigurationContext.Provider>
    )

    render(element)

    expect(navigationContext.getParent()?.navigate).toBeCalledTimes(1)
    expect(navigationContext.getParent()?.navigate).toBeCalledWith('Chat', { connectionId: '123' })
  })

  test('Navigate to Proof when OOB connection', async () => {
    // @ts-ignore-next-line
    useNotifications.mockReturnValueOnce({ total: 1, notifications: [proofNotif] })
    const element = (
      <ConfigurationContext.Provider value={configurationContext}>
        <ConnectionModal navigation={navigationContext} route={props as any} />
      </ConfigurationContext.Provider>
    )

    render(element)

    expect(navigationContext.navigate).toBeCalledTimes(1)
    expect(navigationContext.navigate).toBeCalledWith('Proof Request', {
      proofId: 'bcd2af54-6021-4389-bb5f-3cc8bbedfb50',
    })
  })
})
