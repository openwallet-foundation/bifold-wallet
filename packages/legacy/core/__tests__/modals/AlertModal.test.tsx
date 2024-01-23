import { render } from '@testing-library/react-native'
import React from 'react'

import AlertModal from '../../App/components/modals/AlertModal'
import { useConfiguration } from '../../App/contexts/configuration'

jest.mock('../../App/contexts/configuration', () => ({
  useConfiguration: jest.fn(),
}))

describe('AlertModal Component', () => {
  test('Renders correctly', async () => {
    const tree = render(<AlertModal title="Hello" message="World" />)

    expect(tree).toMatchSnapshot()
  })

  beforeEach(() => {
    // @ts-ignore-next-line
    useConfiguration.mockReturnValue({ showDetailsInfo: true })
    jest.clearAllMocks()
  })

})
