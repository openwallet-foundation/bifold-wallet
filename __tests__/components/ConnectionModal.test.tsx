import React from 'react'
import { create } from 'react-test-renderer'

import ConnectionModal from '../../App/components/modals/ConnectionModal'

describe('ConnectionModal Component', () => {
  it.skip('Renders correctly', () => {
    const tree = create(<ConnectionModal />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
