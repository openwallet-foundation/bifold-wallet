import { CredentialRecord, CredentialState } from '@aries-framework/core'
import { useCredentialById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { render, waitFor, fireEvent } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import LoadingModal from '../../App/components/modals/LoadingModal'
import { testIdWithKey } from '../../App/utils/testable'

describe('displays loading screen', () => {
  test('renders correctly', () => {
    const tree = render(<LoadingModal />)

    expect(tree).toMatchSnapshot()
  })

  test('contains testIDs', () => {
    const tree = render(<LoadingModal />)

    const loadingModalScreenID = tree.getByTestId(testIdWithKey('LoadingModalScreen'))
    const loadingActivityIndicatorID = tree.getByTestId(testIdWithKey('LoadingActivityIndicator'))

    expect(loadingModalScreenID).not.toBeNull()
    expect(loadingActivityIndicatorID).not.toBeNull()
  })
})
