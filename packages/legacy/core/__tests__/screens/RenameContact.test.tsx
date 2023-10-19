import { useConnectionById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { render } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import RenameContact from '../../App/screens/RenameContact'
import { testIdWithKey } from '../../App/utils/testable'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})
jest.mock('react-native-fs', () => ({}))
jest.mock('@hyperledger/anoncreds-react-native', () => ({}))
jest.mock('@hyperledger/aries-askar-react-native', () => ({}))
jest.mock('@hyperledger/indy-vdr-react-native', () => ({}))
jest.mock('react-native-permissions', () => require('react-native-permissions/mock'))
jest.mock('react-native-device-info', () => {
  return {
    getVersion: () => 1,
    getBuildNumber: () => 1,
  }
})
const connectionPath = path.join(__dirname, '../fixtures/connection-v1.json')
const connection = JSON.parse(fs.readFileSync(connectionPath, 'utf8'))
// @ts-ignore-next-line
useConnectionById.mockReturnValue(connection)

describe('RenameContact Screen', () => {
  test('LimitedInput, continue button, and cancel button are present', async () => {
    const tree = render(
      <RenameContact navigation={useNavigation()} route={{ params: { connectionId: connection.id } } as any} />
    )

    const ContactNameInput = await tree.getByTestId(testIdWithKey('NameInput'))
    const SaveButton = await tree.getByTestId(testIdWithKey('Save'))
    const CancelButton = await tree.getByTestId(testIdWithKey('Cancel'))

    expect(ContactNameInput).not.toBeNull()
    expect(SaveButton).not.toBeNull()
    expect(CancelButton).not.toBeNull()
  })
})
