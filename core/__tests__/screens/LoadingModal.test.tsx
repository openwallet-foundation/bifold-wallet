import { render } from '@testing-library/react-native'
import React from 'react'

import LoadingModal from '../../App/components/modals/LoadingModal'
import { testIdWithKey } from '../../App/utils/testable'

describe('displays loading screen', () => {
  test('renders correctly', () => {
    const tree = render(<LoadingModal />)

    expect(tree).toMatchSnapshot()
  })

  test('contains testIDs', () => {
    const { getByTestId } = render(<LoadingModal />)

    const loadingActivityIndicatorID = getByTestId(testIdWithKey('LoadingActivityIndicator'))

    expect(loadingActivityIndicatorID).not.toBeNull()
  })
})
