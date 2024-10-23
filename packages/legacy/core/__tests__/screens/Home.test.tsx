import { BasicMessageRecord, CredentialExchangeRecord as CredentialRecord, ProofExchangeRecord } from '@credo-ts/core'
import { useNavigation } from '@react-navigation/native'
import { fireEvent, render, act } from '@testing-library/react-native'

import React, { useMemo } from 'react'

// eslint-disable-next-line import/no-named-as-default
import Home from '../../App/screens/Home'
import { testIdWithKey } from '../../App/utils/testable'
import { BasicAppContext } from '../helpers/app'

import { useBasicMessages, useCredentialByState, useProofByState } from '@credo-ts/react-hooks'

jest.useFakeTimers()

describe('displays a home screen', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
    // jest.resetAllMocks()
  })

  test.skip('defaults to no notifications', async () => {
    // @ts-expect-error This is a mock object and the fn exists
    useBasicMessages.mockReturnValue({ records: [] as BasicMessageRecord[] })
    // @ts-expect-error This is a mock object and the fn exists
    useCredentialByState.mockImplementation(() => {
      return useMemo(() => [] as CredentialRecord[], [])
    })
    // @ts-expect-error This is a mock object and the fn exists
    useProofByState.mockReturnValue([] as ProofExchangeRecord[])

    const tree = render(
      <BasicAppContext>
        <Home route={{} as any} navigation={useNavigation()} />
      </BasicAppContext>
    )

    await act(async () => {
      jest.runAllTimers()

      // const notificationLabel = await tree.findByText(testIdWithKey('NoNewUpdates'))
      const notificationLabel = await tree.findByTestId(testIdWithKey('NoNewUpdates'))
      expect(tree).toMatchSnapshot()
      expect(notificationLabel).toBeTruthy()
    })
  })

  test.skip('notifications are displayed', async () => {
    const tree = render(
      <BasicAppContext>
        <Home route={{} as any} navigation={useNavigation()} />
      </BasicAppContext>
    )

    await act(async () => {
      jest.runAllTimers()
      const flatListInstance = await tree.findAllByTestId(testIdWithKey('NotificationListItem'))
      expect(flatListInstance).toHaveLength(5)
    })
  })

  test('touch offer navigation correctly', async () => {
    const navigation = useNavigation()
    const view = render(
      <BasicAppContext>
        <Home route={{} as any} navigation={useNavigation()} />
      </BasicAppContext>
    )

    const button = await view.findByTestId(testIdWithKey('ViewOffer'))

    expect(button).toBeDefined()

    await act(() => {
      fireEvent(button, 'press')
    })

    expect(navigation.navigate).toHaveBeenCalledTimes(1)
    expect(navigation.navigate).toHaveBeenCalledWith('Connection Stack', {
      screen: 'Connection',
      params: { credentialId: '99bbf805-fc82-44dc-82eb-e3eb1e7f8ab7' },
    })
  })

  test('touch proof navigates correctly', async () => {
    const { findAllByTestId } = render(
      <BasicAppContext>
        <Home route={{} as any} navigation={useNavigation()} />
      </BasicAppContext>
    )

    const buttons = await findAllByTestId(testIdWithKey('ViewProofRecord'))
    const navigation = useNavigation()

    expect(buttons).toBeDefined()

    await act(() => {
      fireEvent(buttons[0], 'press')

      expect(navigation.navigate).toHaveBeenCalledTimes(1)
      expect(navigation.navigate).toHaveBeenCalledWith('Connection Stack', {
        screen: 'Connection',
        params: { proofId: '5658ee3f-04dc-487a-8524-3e070c820b8e' },
      })
    })
  })

  test('touch basic message navigation correctly', async () => {
    const navigation = useNavigation()
    const { findAllByTestId } = render(
      <BasicAppContext>
        <Home route={{} as any} navigation={useNavigation()} />
      </BasicAppContext>
    )

    await act(async () => {
      const button = (await findAllByTestId(testIdWithKey('ViewBasicMessage')))[0]
      expect(button).toBeDefined()
      fireEvent(button, 'press')

      expect(navigation.getParent()?.navigate).toHaveBeenCalledTimes(1)
      expect(navigation.getParent()?.navigate).toHaveBeenCalledWith('Contacts Stack', {
        screen: 'Chat',
        params: { connectionId: 'c426f2dc-0ffc-4252-b7d6-2304755f84d9' },
      })
    })
  })
})
