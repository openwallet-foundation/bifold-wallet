import { act, render } from '@testing-library/react-native'
import React from 'react'

import LoadingModal from '../../App/components/modals/LoadingModal'
import { testIdWithKey } from '../../App/utils/testable'

describe('displays loading screen', () => {
  beforeAll(()=>{
    jest.useFakeTimers()
  })
  afterAll(()=>{
    jest.useRealTimers()
  })
  test('renders correctly', () => {
    const tree = render(<LoadingModal />)

    expect(tree).toMatchSnapshot()
  })

  test('contains testIDs', async () => {
    let tree: ReturnType<typeof render>
    
    tree = render(<LoadingModal />)
    await act(()=>{
      jest.runAllTimers()
    })
    await act(async ()=>{
      const loadingActivityIndicatorID = await tree.findByTestId(testIdWithKey('LoadingActivityIndicator'))
      expect(loadingActivityIndicatorID).not.toBeNull()
    })
  })
})
