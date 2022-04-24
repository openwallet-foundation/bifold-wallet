import { render } from '@testing-library/react-native'
import React from 'react'

import AvatarView from '../../App/components/misc/AvatarView'
import { theme } from '../../App/theme'
import * as themeContext from '../../App/utils/themeContext' // note we're importing with a * to import all the exports

describe('AvatarView Component', () => {
  test('Renders correctly', async () => {
    jest.spyOn(themeContext, 'useThemeContext').mockImplementation(() => theme)
    const tree = render(<AvatarView name={'Bacon'} />)

    expect(tree).toMatchSnapshot()
  })
})
