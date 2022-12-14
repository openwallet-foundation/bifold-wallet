import { CredentialExchangeRecord, ConnectionRecord } from '@aries-framework/core'
import { useCredentialById, useConnectionById } from '@aries-framework/react-hooks'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock'
import { useNavigation } from '@react-navigation/core'
import { act, fireEvent, render } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import { ConfigurationContext } from '../../App/contexts/configuration'
import { NetworkProvider } from '../../App/contexts/network'
import CredentialOffer from '../../App/screens/CredentialOffer'
import { testIdWithKey } from '../../App/utils/testable'
import configurationContext from '../contexts/configuration'

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('react-native-localize', () => {})
jest.useFakeTimers('legacy')
jest.spyOn(global, 'setTimeout')

const props = { params: { visible: true, credentialId: '123' } }

const connectionPath = path.join(__dirname, '../fixtures/faber-connection.json')
const connection = JSON.parse(fs.readFileSync(connectionPath, 'utf8'))

const credentialPath = path.join(__dirname, '../fixtures/degree-credential.json')
const credential = JSON.parse(fs.readFileSync(credentialPath, 'utf8'))

const connectionRecord = new ConnectionRecord(connection)
const credentialRecord = new CredentialExchangeRecord(credential)
credentialRecord.credentials.push({
  credentialRecordType: 'indy',
  credentialRecordId: '',
})
// TODO:(jl) Make a fn to revive JSON dates properly and pass to `parse`
credentialRecord.createdAt = new Date(credentialRecord.createdAt)

// @ts-ignore
useConnectionById.mockReturnValue(connectionRecord)
// @ts-ignore
useCredentialById.mockReturnValue(credentialRecord)

describe('displays a credential offer screen', () => {
  test('renders correctly', async () => {
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <NetworkProvider>
          <CredentialOffer route={props as any} navigation={useNavigation()} />
        </NetworkProvider>
      </ConfigurationContext.Provider>
    )

    await act(async () => null)

    expect(tree).toMatchSnapshot()
  })

  test('shows offer controls', async () => {
    const { getByTestId } = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <NetworkProvider>
          <CredentialOffer route={props as any} navigation={useNavigation()} />
        </NetworkProvider>
      </ConfigurationContext.Provider>
    )

    await act(async () => null)

    const acceptButton = getByTestId(testIdWithKey('AcceptCredentialOffer'))
    const declineButton = getByTestId(testIdWithKey('DeclineCredentialOffer'))

    expect(acceptButton).not.toBeNull()
    expect(declineButton).not.toBeNull()
  })

  test('accepting a credential', async () => {
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <NetworkProvider>
          <CredentialOffer route={props as any} navigation={useNavigation()} />
        </NetworkProvider>
      </ConfigurationContext.Provider>
    )

    await act(async () => null)

    const acceptButton = tree.getByTestId(testIdWithKey('AcceptCredentialOffer'))

    fireEvent(acceptButton, 'press')

    expect(tree).toMatchSnapshot()
  })

  test('declining a credential', async () => {
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <NetworkProvider>
          <CredentialOffer route={props as any} navigation={useNavigation()} />
        </NetworkProvider>
      </ConfigurationContext.Provider>
    )

    await act(async () => null)

    const declineButton = tree.getByTestId(testIdWithKey('DeclineCredentialOffer'))

    fireEvent(declineButton, 'press')

    expect(tree).toMatchSnapshot()
  })
})
