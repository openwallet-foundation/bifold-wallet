import { render } from '@testing-library/react-native'
import React from 'react'

import AvatarView from '../../src/components/misc/AvatarView'
import * as themeContext from '../../src/contexts/theme' // note we're importing with a * to import all the exports
import { theme } from '../../src/theme'

describe('AvatarView Component', () => {
  test('Renders correctly', async () => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => theme)
    const tree = render(<AvatarView name={'Bacon'} />)

    expect(tree).toMatchSnapshot()
  })

  test('Renders correctly 2', async () => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => theme)
    const tree = render(<AvatarView name={'Bacon'} />)

    expect(tree).toMatchSnapshot()
  })
})
