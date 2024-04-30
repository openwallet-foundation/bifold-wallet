import { useNavigation } from '@react-navigation/core'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import { ConfigurationContext } from '../../App/contexts/configuration'
import { StoreProvider, defaultState } from '../../App/contexts/store'
import ListContacts from '../../App/screens/ListContacts'
import configurationContext from '../contexts/configuration'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('react-native-localize', () => {})

const navigation = useNavigation()

describe('ListContacts Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Renders correctly', async () => {
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <ListContacts navigation={navigation as any} />
      </ConfigurationContext.Provider>
    )
    await waitFor(() => {})
    await new Promise((r) => setTimeout(r, 2000))
    expect(tree).toMatchSnapshot()
  })

  test('pressing on a contact in the list takes the user to a contact history screen', async () => {
    const { findByText } = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <ListContacts navigation={navigation as any} />
      </ConfigurationContext.Provider>
    )

    await waitFor(async () => {
      const connectionRecord = await findByText('Faber', { exact: true })
      fireEvent(connectionRecord, 'press')
      expect(navigation.navigate).toBeCalledWith('Contacts Stack', {
        screen: 'Chat',
        params: {
          connectionId: '1',
        },
      })
    })
  })

  test('Hide list filters out specific contacts', async () => {
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
          preferences: {
            ...defaultState.preferences,
            developerModeEnabled: false,
          },
        }}
      >
        <ConfigurationContext.Provider value={{ ...configurationContext, contactHideList: ['Faber'] }}>
          <ListContacts navigation={navigation as any} />
        </ConfigurationContext.Provider>
      </StoreProvider>
    )
    await waitFor(async () => {
      const faberContact = await tree.queryByText('Faber', { exact: true })
      const bobContact = await tree.queryByText('Bob', { exact: true })
      expect(faberContact).toBe(null)
      expect(bobContact).not.toBe(null)
    })
  })

  test('Hide list does not filter out specific contacts when developer mode is enabled', async () => {
    const navigation = useNavigation()
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
          preferences: {
            ...defaultState.preferences,
            developerModeEnabled: true,
          },
        }}
      >
        <ConfigurationContext.Provider value={{ ...configurationContext, contactHideList: ['Faber'] }}>
          <ListContacts navigation={navigation as any} />
        </ConfigurationContext.Provider>
      </StoreProvider>
    )
    await waitFor(async () => {
      const faberContact = await tree.queryByText('Faber', { exact: true })
      const bobContact = await tree.queryByText('Bob', { exact: true })
      expect(faberContact).not.toBe(null)
      expect(bobContact).not.toBe(null)
    })
  })
})
