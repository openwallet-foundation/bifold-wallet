/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigation } from '@react-navigation/native'
import { render, act } from '@testing-library/react-native'
import React from 'react'
import { DeviceEventEmitter } from 'react-native'

import OpenIDConnectionScreen from '../../src/modules/openid/screens/OpenIDConnection'
import { testIdWithKey } from '../../src/utils/testable'
import { BasicAppContext } from '../helpers/app'
import { BifoldError } from '../../src/types/error'
import { EventTypes } from '../../src/constants'

const openIDUri = '123456'
const openIDPresentationUri = '//'

jest.useFakeTimers({ legacyFakeTimers: true })

describe('OpenID Connection Screen', () => {

  beforeEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
  })

  test('Renders correctly', async () => {

    const tree = (
      <BasicAppContext>
        <OpenIDConnectionScreen navigation={useNavigation()} route={{ params: { openIDUri, openIDPresentationUri } } as any} />
      </BasicAppContext>
    )
    const { getByTestId } = render(tree)

    const loading = getByTestId(testIdWithKey('Loading'))

    expect(loading).not.toBeNull()

  })

  test('Displays error correctly', async () => {

    const tree = (
      <BasicAppContext>
        <OpenIDConnectionScreen navigation={useNavigation()} route={{ params: { openIDUri, openIDPresentationUri } } as any} />
      </BasicAppContext>
    )
    const { findByText } = render(tree)

    act(() => {
      const error = new BifoldError(
        'ErrorTitle',
        'ErrorDescription',
        'ErrorMessage',
        1043
      )
      DeviceEventEmitter.emit(EventTypes.OPENID_CONNECTION_ERROR, error)
    })

    expect(await findByText('Error.GenericError.Title')).not.toBeNull()
    expect(await findByText('FullScreenErrorModal.PrimaryCTA')).not.toBeNull()

  })

})
