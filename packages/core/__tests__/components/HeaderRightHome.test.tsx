import { render } from '@testing-library/react-native'
import React from 'react'
import HeaderRightHome from '../../src/components/buttons/HeaderHome'
import { BasicAppContext } from '../helpers/app'

describe('HeaderRightHome Component', () => {
  test('Renders correctly', () => {
    const tree = render(
      <BasicAppContext>
        <HeaderRightHome />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })
})
