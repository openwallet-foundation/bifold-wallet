import { useConnectionById } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/native'
import { render } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import RenameContact from '../../src/screens/RenameContact'
import { testIdWithKey } from '../../src/utils/testable'

jest.mock('react-native-device-info', () => {
  return {
    getVersion: () => 1,
    getBuildNumber: () => 1,
  }
})
const connectionPath = path.join(__dirname, '../fixtures/connection-v1.json')
const connection = JSON.parse(fs.readFileSync(connectionPath, 'utf8'))
// @ts-expect-error useConnectionById will be replaced with a mock which does have this method
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
