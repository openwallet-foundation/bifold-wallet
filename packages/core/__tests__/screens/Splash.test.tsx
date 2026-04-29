import { act, render } from '@testing-library/react-native'
import React from 'react'
import { container } from 'tsyringe'

import { AuthContext } from '../../src/contexts/auth'
import Splash from '../../src/screens/Splash'
import authContext from '../contexts/auth'
import { CustomBasicAppContext } from '../helpers/app'
import { TOKENS } from '../../src/container-api'
import { MainContainer } from '../../src/container-impl'

jest.mock('../../src/services/keychain', () => ({
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
    const context = new MainContainer(container.createChildContainer()).init()
    const config = context.resolve(TOKENS.CONFIG)
    context.container.registerInstance(TOKENS.CONFIG, { ...config, enableAttestation: false })
    context.container.registerInstance(TOKENS.FN_ATTESTATION_GET_CHALLENGE, () => '')
    context.container.registerInstance(TOKENS.FN_ATTESTATION_GET_JWT, () => '')
    const tree = render(
      <CustomBasicAppContext container={context}>
        <AuthContext.Provider value={authContext}>
          <Splash initializeAgent={jest.fn()} />
        </AuthContext.Provider>
      </CustomBasicAppContext>
    )
    await act(() => {
      jest.runAllTimers()
    })
    expect(tree).toMatchSnapshot()
  })
})
