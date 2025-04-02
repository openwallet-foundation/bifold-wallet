/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigation } from '@react-navigation/native'
import { fireEvent, render, waitFor, act } from '@testing-library/react-native'
import React from 'react'

import ConnectionModal from '../../src/screens/Connection'
import { testIdWithKey } from '../../src/utils/testable'
import timeTravel from '../helpers/timetravel'
import { BasicAppContext } from '../helpers/app'

jest.useFakeTimers({ legacyFakeTimers: true })

describe('Connection Screen', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
  })

  test('Renders and updates after delay', async () => {
    const oobRecordId = '979c6c76-2885-4315-842b-2080a76bad13'

    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={{ params: { oobRecordId } } as any} />
      </BasicAppContext>
    )
    const { getByTestId } = render(element)

    expect(() => {
      getByTestId(testIdWithKey('SlowLoadTitle'))
    }).toThrow('Unable to find an element with testID: com.ariesbifold:id/SlowLoadTitle')

    await waitFor(() => {
      timeTravel(10000)
    })

    const label = getByTestId(testIdWithKey('SlowLoadTitle'))
    expect(label).not.toBeNull()
  })

  test('Cancel navigates Home', async () => {
    const oobRecordId = '65baae8b-2284-4e62-8d14-aa273cda78ca'

    const navigation = useNavigation()
    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={{ params: { oobRecordId } } as any} />
      </BasicAppContext>
    )

    const { getByTestId } = render(element)
    const dismissButton = getByTestId(testIdWithKey('Cancel'))
    fireEvent(dismissButton, 'press')

    expect(navigation.navigate).toBeCalledTimes(1)
    expect(navigation.navigate).toBeCalledWith('Tab Home Stack', { screen: 'Home' })
    // @ts-expect-error This is a mock object and the fn exists
    expect(navigation.replace).toBeCalledTimes(0)
    expect(navigation.getParent()?.dispatch).toBeCalledTimes(0)
  })

  test('No connection, show to proof', async () => {
    const oobRecordId = '548ee21c-5b98-4eeb-8fe0-5a5019a5f4a5'
    const navigation = useNavigation()

    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={{ params: { oobRecordId } } as any} />
      </BasicAppContext>
    )

    const tree = render(element)

    await act(async () => {
      timeTravel(1000)

      const view = await tree.findByTestId(testIdWithKey('ProofRequestLoading'))

      expect(view).not.toBeNull()
      expect(tree).toMatchSnapshot()
      expect(navigation.navigate).toBeCalledTimes(0)
      // @ts-expect-error This is a mock object and the fn exists
      expect(navigation.replace).toBeCalledTimes(0)
      expect(navigation.getParent()?.dispatch).toBeCalledTimes(0)
    })
  })

  test('Connection, no goal code navigation to chat', async () => {
    const oobRecordId = 'd1036d48-4b88-4f63-9d7e-b4b0476f8108'
    const navigation = useNavigation()
    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={{ params: { oobRecordId } } as any} />
      </BasicAppContext>
    )

    render(element)

    await waitFor(() => {
      timeTravel(1000)
    })

    expect(navigation.navigate).toBeCalledTimes(0)
    expect(navigation.getParent()?.dispatch).toBeCalledTimes(1)
  })

  test('Valid goal code aries.vc.issue extracted, show to offer accept', async () => {
    const oobRecordId = 'b8aaa6fe-47c9-4ed8-8cb9-96299e4e0109'
    const navigation = useNavigation()
    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={{ params: { oobRecordId } } as any} />
      </BasicAppContext>
    )

    await waitFor(() => {
      timeTravel(1000)
    })

    const tree = render(element)

    // to ensure we're  rendering the correct component
    const button = await tree.findByTestId(testIdWithKey('AcceptCredentialOffer'))

    expect(button).not.toBeNull()
    expect(tree).toMatchSnapshot()
    expect(navigation.navigate).toBeCalledTimes(0)
    // @ts-expect-error This is a mock object and the fn exists
    expect(navigation.replace).toBeCalledTimes(0)
    expect(navigation.getParent()?.dispatch).toBeCalledTimes(0)
  })

  test('Valid goal code aries.vc.verify extracted, show to proof request', async () => {
    const oobRecordId = 'bc37583b-cee1-43aa-96f4-b7087b71fbc5'
    const navigation = useNavigation()

    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={{ params: { oobRecordId } } as any} />
      </BasicAppContext>
    )

    await waitFor(() => {
      timeTravel(1000)
    })

    const tree = render(element)
    // to ensure we're  rendering the correct component
    const view = await tree.findByTestId(testIdWithKey('ProofRequestLoading'))

    expect(view).not.toBeNull()
    // expect(tree).toMatchSnapshot()
    expect(navigation.navigate).toBeCalledTimes(0)
    // @ts-expect-error This is a mock object and the fn exists
    expect(navigation.replace).toBeCalledTimes(0)
    expect(navigation.getParent()?.dispatch).toBeCalledTimes(0)
  })
  // f
  test('Valid goal code aries.vc.verify.once extracted, show to proof request', async () => {
    const oobRecordId = '27cfe0f6-253d-4105-a87e-2d8b1b0234c3'
    const navigation = useNavigation()

    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={{ params: { oobRecordId } } as any} />
      </BasicAppContext>
    )

    await waitFor(() => {
      timeTravel(1000)
    })

    const tree = render(element)
    // to ensure we're  rendering the correct component
    const view = await tree.findByTestId(testIdWithKey('ProofRequestLoading'))

    expect(view).not.toBeNull()
    // expect(tree).toMatchSnapshot()
    expect(navigation.navigate).toBeCalledTimes(0)
    // @ts-expect-error This is a mock object and the fn exists
    expect(navigation.replace).toBeCalledTimes(0)
    expect(navigation.getParent()?.dispatch).toBeCalledTimes(0)
  })

  test('Invalid goal code, navigate to chat', async () => {
    const oobRecordId = '6e739679-db69-4228-9fdf-d1b8cc2431aa'
    const navigation = useNavigation()
    const element = (
      <BasicAppContext>
        <ConnectionModal navigation={useNavigation()} route={{ params: { oobRecordId } } as any} />
      </BasicAppContext>
    )

    render(element)

    await waitFor(() => {
      timeTravel(1000)
    })

    expect(navigation.navigate).toBeCalledTimes(0)
    expect(navigation.getParent()?.dispatch).toBeCalledTimes(1)
  })
})
