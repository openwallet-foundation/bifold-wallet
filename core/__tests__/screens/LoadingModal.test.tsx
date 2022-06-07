import { render } from '@testing-library/react-native'
import React from 'react'

import LoadingModal from '../../App/components/modals/LoadingModal'
import { testIdWithKey } from '../../App/utils/testable'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

describe('displays loading screen', () => {
  test('renders correctly', () => {
    const tree = render(<LoadingModal />)

    expect(tree).toMatchSnapshot()
  })

  test('contains testIDs', () => {
    const tree = render(<LoadingModal />)

    const loadingActivityIndicatorID = tree.getByTestId(testIdWithKey('LoadingActivityIndicator'))

    expect(loadingActivityIndicatorID).not.toBeNull()
  })
})
