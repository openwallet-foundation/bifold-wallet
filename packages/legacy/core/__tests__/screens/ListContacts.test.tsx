import { useNavigation } from '@react-navigation/native'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import { StoreProvider, defaultState } from '../../App/contexts/store'
import ListContacts from '../../App/screens/ListContacts'
import { BasicAppContext, CustomBasicAppContext } from '../helpers/app'
import { TOKENS } from '../../App/container-api'
import { MainContainer } from '../../App/container-impl'
import { container } from 'tsyringe'

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('react-native-localize', () => { })

const navigation = useNavigation()

describe('ListContacts Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <ListContacts navigation={navigation as any} />
      </BasicAppContext>
    )
    await waitFor(() => { })
    await new Promise((r) => setTimeout(r, 2000))
    expect(tree).toMatchSnapshot()
  })

  test('pressing on a contact in the list takes the user to a contact history screen', async () => {
    const { findByText } = render(
      <BasicAppContext>
        <ListContacts navigation={navigation as any} />
      </BasicAppContext>
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
    const context = new MainContainer(container.createChildContainer()).init()
    const config = context.resolve(TOKENS.CONFIG)
    context.container.registerInstance(TOKENS.CONFIG, { ...config, contactHideList: ['Faber'] })
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
        <CustomBasicAppContext container={context}>
          <ListContacts navigation={navigation as any} />
        </CustomBasicAppContext>
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
    const context = new MainContainer(container.createChildContainer()).init()
    const config = context.resolve(TOKENS.CONFIG)
    context.container.registerInstance(TOKENS.CONFIG, { ...config, contactHideList: ['Faber'] })
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
        <CustomBasicAppContext container={context}>
          <ListContacts navigation={navigation as any} />
        </CustomBasicAppContext>
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
