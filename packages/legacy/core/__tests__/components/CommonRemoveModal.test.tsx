import { render } from '@testing-library/react-native'
import React from 'react'

import CommonRemoveModal from '../../App/components/modals/CommonRemoveModal'
import { RemoveType } from '../../App/types/remove'

describe('ErrorModal Component', () => {
  test('Renders correctly', async () => {
    const tree = render(<CommonRemoveModal removeType={RemoveType.Credential} />)

    expect(tree).toMatchSnapshot()
  })
})
