import { render } from '@testing-library/react-native'
import React from 'react'
import { PINEntryUsage } from '../../src/screens/PINVerify'
import VerifyPINModal from '../../src/components/modals/VerifyPINModal'
import { BasicAppContext } from '../helpers/app'
import authContext from '../contexts/auth'
import { AuthContext } from '../../src/contexts/auth'

describe('VerifyPINModal Component', () => {
  test('Renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <AuthContext.Provider value={authContext}>
          <VerifyPINModal
            title="Title"
            onBackPressed={jest.fn()}
            onAuthenticationComplete={jest.fn()}
            onCancelAuth={jest.fn()}
            PINVerifyModalUsage={PINEntryUsage.ChangePIN}
            visible
          />
        </AuthContext.Provider>
      </BasicAppContext>
    )
    expect(tree).toMatchSnapshot()
  })
})
