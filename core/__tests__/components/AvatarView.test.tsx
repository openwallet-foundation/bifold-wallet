import { render } from '@testing-library/react-native'
import React from 'react'

import AvatarView from '../../App/components/misc/AvatarView'
import * as themeContext from '../../App/contexts/theme' // note we're importing with a * to import all the exports
import { theme } from '../../App/theme'

describe('AvatarView Component', () => {
  test('Renders correctly', async () => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => theme)
    const tree = render(<AvatarView name={'Bacon'} />)

    expect(tree).toMatchSnapshot()
  })
})
