import { useNavigation } from '@react-navigation/native'
import { act, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import { LocalStorageKeys } from '../../App/constants'
import { AuthContext } from '../../App/contexts/auth'
import { testDefaultState } from '../contexts/store'
import { StoreProvider } from '../../App/contexts/store'
import Splash from '../../App/screens/Splash'
import AsyncStorage from '@react-native-async-storage/async-storage'
import authContext from '../contexts/auth'
import { loadLoginAttempt } from '../../App/services/keychain'
import { BasicAppContext } from '../helpers/app'

jest.mock('../../App/services/keychain', () => ({
  loadLoginAttempt: jest.fn(),
}))

describe('Splash Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  beforeAll(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.clearAllTimers()
  })
  afterAll(() => {
    jest.useRealTimers()
  })
  test('Renders default correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <AuthContext.Provider value={authContext}>
          <Splash />
        </AuthContext.Provider>
      </BasicAppContext>
    )
    await act(() => {
      jest.runAllTimers()
    })
    expect(tree).toMatchSnapshot()
  })
})
