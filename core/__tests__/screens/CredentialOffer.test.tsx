import { CredentialRecord, ConnectionRecord } from '@aries-framework/core'
import { useCredentialById, useConnectionById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { fireEvent, render } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import CredentialOffer from '../../App/screens/CredentialOffer'
import { testIdWithKey } from '../../App/utils/testable'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})
jest.useFakeTimers('legacy')
jest.spyOn(global, 'setTimeout')

const props = { params: { visible: true, credentialId: '123' } }

const connectionPath = path.join(__dirname, '../fixtures/faber-connection.json')
const connection = JSON.parse(fs.readFileSync(connectionPath, 'utf8'))

const credentialPath = path.join(__dirname, '../fixtures/degree-credential.json')
const credential = JSON.parse(fs.readFileSync(credentialPath, 'utf8'))

const connectionRecord = new ConnectionRecord(connection)
const credentialRecord = new CredentialRecord(credential)
// TODO:(jl) Make a fn to revive JSON dates properly and pass to `parse`
credentialRecord.createdAt = new Date(credentialRecord.createdAt)

// @ts-ignore
useConnectionById.mockReturnValue(connectionRecord)
// @ts-ignore
useCredentialById.mockReturnValue(credentialRecord)

describe('displays a credential offer screen', () => {
  test('renders correctly', () => {
    const tree = render(<CredentialOffer route={props as any} navigation={useNavigation()} />)

    expect(tree).toMatchSnapshot()
  })

  test('shows offer controls', async () => {
    const { getByTestId } = render(<CredentialOffer route={props as any} navigation={useNavigation()} />)

    const acceptButton = getByTestId(testIdWithKey('AcceptCredentialOffer'))
    const declineButton = getByTestId(testIdWithKey('DeclineCredentialOffer'))

    expect(acceptButton).not.toBeNull()
    expect(declineButton).not.toBeNull()
  })

  test('accepting a credential', async () => {
    const tree = render(<CredentialOffer route={props as any} navigation={useNavigation()} />)

    const acceptButton = tree.getByTestId(testIdWithKey('AcceptCredentialOffer'))

    fireEvent(acceptButton, 'press')

    expect(tree).toMatchSnapshot()
  })

  test('declining a credential', async () => {
    const tree = render(<CredentialOffer route={props as any} navigation={useNavigation()} />)

    const declineButton = tree.getByTestId(testIdWithKey('DeclineCredentialOffer'))

    fireEvent(declineButton, 'press')

    expect(tree).toMatchSnapshot()
  })
})
