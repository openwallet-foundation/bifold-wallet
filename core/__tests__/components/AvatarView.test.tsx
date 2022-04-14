import { render } from '@testing-library/react-native'
import React from 'react'

import AvatarView from '../../App/components/misc/AvatarView'
import * as themeContext from '../../App/utils/themeContext' // note we're importing with a * to import all the exports
import { defaultTheme } from '../../App/utils/themeContext'

describe('AvatarView Component', () => {
  test('Renders correctly', async () => {
    jest.spyOn(themeContext, 'useThemeContext').mockImplementation(() => defaultTheme)
    const tree = render(<AvatarView name={'Bacon'} />)

    expect(tree).toMatchSnapshot()
  })
})
