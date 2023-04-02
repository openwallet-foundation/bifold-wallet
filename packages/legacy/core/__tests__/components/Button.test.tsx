import { render } from '@testing-library/react-native'
import React from 'react'

// eslint-disable-next-line import/no-named-as-default
import Button, { ButtonType } from '../../App/components/buttons/Button'

describe('Button Component', () => {
  test('Primary renders correctly', () => {
    const tree = render(
      <Button
        title={'Hello Primary'}
        accessibilityLabel={'primary'}
        onPress={() => {
          return
        }}
        buttonType={ButtonType.Primary}
      />
    )

    expect(tree).toMatchSnapshot()
  })

  test('Secondary renders correctly', () => {
    const tree = render(
      <Button
        title={'Hello Secondary'}
        accessibilityLabel={'secondary'}
        onPress={() => {
          return
        }}
        buttonType={ButtonType.Secondary}
      />
    )

    expect(tree).toMatchSnapshot()
  })
})
