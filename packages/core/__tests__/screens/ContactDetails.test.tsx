import { useConnectionById } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { act, fireEvent, render } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import { StoreContext } from '../../src'
import ContactDetails from '../../src/screens/ContactDetails'
import { ContactStackParams, Screens } from '../../src/types/navigators'
import { testIdWithKey } from '../../src/utils/testable'
import { testDefaultState } from '../contexts/store'
import { BasicAppContext } from '../helpers/app'

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

describe('ContactDetails Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-expect-error useConnectionById will be replaced with a mock which does have this method
    useConnectionById.mockReturnValue(connection)
  })

  test('Renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
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
      </BasicAppContext>
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
      <BasicAppContext>
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
      </BasicAppContext>
    )
    expect(tree).toMatchSnapshot()
  })

  test('Edit contact name button navigates', async () => {
    const navigation = useNavigation<StackNavigationProp<ContactStackParams, Screens.ContactDetails>>()

    const { getByTestId } = render(
      <BasicAppContext>
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
      </BasicAppContext>
    )
    const editButton = getByTestId(testIdWithKey('RenameContact'))
    await act(async () => {
      fireEvent(editButton, 'press')
      expect(navigation.navigate).toHaveBeenCalledTimes(1)
    })
  })

  test('JSON Detail button exists when dev mode is enabled', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: true,
      },
    }

    const tree = render(
      <BasicAppContext>
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
      </BasicAppContext>
    )
    const jsonDetailsButton = tree.getByTestId(testIdWithKey('JSONDetails'))
    expect(jsonDetailsButton).not.toBeNull()
  })
  test('JSON Details button does not exist when dev mode is disabled', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: false,
      },
    }

    const tree = render(
      <BasicAppContext>
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
      </BasicAppContext>
    )
    expect(() => tree.getByTestId(testIdWithKey('JSONDetails'))).toThrow()
  })

  test('JSON Details button navigates', async () => {
    const navigation = useNavigation<StackNavigationProp<ContactStackParams, Screens.ContactDetails>>()
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: true,
      },
    }

    const tree = render(
      <BasicAppContext>
        <StoreContext.Provider
          value={[
            customState,
            () => {
              return
            },
          ]}
        >
          <ContactDetails navigation={navigation} route={{ params: { connectionId: connection.id } } as any} />
        </StoreContext.Provider>
      </BasicAppContext>
    )
    const jsonDetailsButton = tree.getByTestId(testIdWithKey('JSONDetails'))
    await act(async () => {
      fireEvent(jsonDetailsButton, 'press')
      expect(navigation.navigate).toHaveBeenCalledWith(Screens.JSONDetails, {
        jsonBlob: connection,
      })
    })
  })
})
