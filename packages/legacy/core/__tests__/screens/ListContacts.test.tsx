import { fireEvent, render, waitFor } from '@testing-library/react-native'
import React from 'react'
import { container } from 'tsyringe'

import { useNavigation as testUseNavigation } from '../../__mocks__/@react-navigation/native'
import { StoreProvider, defaultState } from '../../App/contexts/store'
import ListContacts from '../../App/screens/ListContacts'
import { BasicAppContext, CustomBasicAppContext } from '../helpers/app'
import { TOKENS } from '../../App/container-api'
import { MainContainer } from '../../App/container-impl'

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('react-native-localize', () => {})
jest.useFakeTimers({ legacyFakeTimers: true })

const navigation = testUseNavigation()

describe('ListContacts Screen', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
  })

  test('Renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <ListContacts navigation={navigation as any} />
      </BasicAppContext>
    )

    await waitFor(() => {})

    expect(tree).toMatchSnapshot()
  })

  test('Pressing on a contact in the list takes the user to a contact history screen', async () => {
    const { findByText } = render(
      <BasicAppContext>
        <ListContacts navigation={navigation as any} />
      </BasicAppContext>
    )

    await waitFor(async () => {
      const connectionRecord = await findByText('BestBC Tea', { exact: true })
      fireEvent(connectionRecord, 'press')

      expect(navigation.navigate).toBeCalledWith('Contacts Stack', {
        screen: 'Chat',
        params: {
          connectionId: 'c426f2dc-0ffc-4252-b7d6-2304755f84d9',
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
      const teaContact = await tree.queryByText('BestBC Tea', { exact: true })
      expect(teaContact).toBe(null)
    })
  })

  test('Hide list does not filter out specific contacts when developer mode is enabled', async () => {
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
      const teaContact = await tree.queryByText('BestBC Tea', { exact: true })
      expect(teaContact).toBe(null)
    })
  })
})
