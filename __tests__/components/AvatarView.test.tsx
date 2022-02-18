import { render } from '@testing-library/react-native'
import React from 'react'

import AvatarView from '../../App/components/misc/AvatarView'

describe('AvatarView Component', () => {
  test('Renders correctly', async () => {
    const tree = render(<AvatarView name={'Bacon'} />)

    expect(tree).toMatchSnapshot()
  })
})
