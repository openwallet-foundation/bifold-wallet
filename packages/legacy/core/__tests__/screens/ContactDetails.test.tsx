import { useConnectionById } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { act, fireEvent, render } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import { StoreContext } from '../../App'
import ContactDetails from '../../App/screens/ContactDetails'
import { ContactStackParams, Screens } from '../../App/types/navigators'
import { testIdWithKey } from '../../App/utils/testable'
import { testDefaultState } from '../contexts/store'

jest.mock('react-native-fs', () => ({}))
jest.mock('@hyperledger/anoncreds-react-native', () => ({}))
jest.mock('@hyperledger/aries-askar-react-native', () => ({}))
jest.mock('@hyperledger/indy-vdr-react-native', () => ({}))
jest.mock('react-native-permissions', () => require('react-native-permissions/mock'))
jest.mock('react-native-vision-camera', () => {
  return require('../../__mocks__/custom/react-native-camera')
})
jest.mock('react-native-device-info', () => {
  return {
    getVersion: () => 1,
    getBuildNumber: () => 1,
  }
})

const connectionPath = path.join(__dirname, '../fixtures/connection-v1.json')
const connection = JSON.parse(fs.readFileSync(connectionPath, 'utf8'))
connection.createdAt = new Date('20230303')

describe('Contact Details Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-ignore-next-line
    useConnectionById.mockReturnValue(connection)
  })

  test('Renders correctly', async () => {
    const tree = render(
      <StoreContext.Provider
        value={[
          testDefaultState,
          () => {
            return
          },
        ]}
      >
        <ContactDetails navigation={useNavigation()} route={{ params: { connectionId: connection.id } } as any} />
      </StoreContext.Provider>
    )
    expect(tree).toMatchSnapshot()
  })

  test('Renders correctly with alt contact name', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        alternateContactNames: {
          [connection.id]: 'Alt Name',
        },
      },
    }

    const tree = render(
      <StoreContext.Provider
        value={[
          customState,
          () => {
            return
          },
        ]}
      >
        <ContactDetails navigation={useNavigation()} route={{ params: { connectionId: connection.id } } as any} />
      </StoreContext.Provider>
    )
    expect(tree).toMatchSnapshot()
  })

  test('Edit contact name button navigates', async () => {
    const navigation = useNavigation<StackNavigationProp<ContactStackParams, Screens.ContactDetails>>()

    const { getByTestId } = render(
      <StoreContext.Provider
        value={[
          testDefaultState,
          () => {
            return
          },
        ]}
      >
        <ContactDetails navigation={navigation} route={{ params: { connectionId: connection.id } } as any} />
      </StoreContext.Provider>
    )
    const editButton = getByTestId(testIdWithKey('RenameContact'))
    await act(async () => {
      fireEvent(editButton, 'press')
      expect(navigation.navigate).toHaveBeenCalledTimes(1)
    })
  })
})
