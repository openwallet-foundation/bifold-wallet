import React from 'react'
import { create } from 'react-test-renderer'

import Button, { ButtonType } from '../../App/components/buttons/Button'

describe('Button Component', () => {
  it('Primary renders correctly', () => {
    const tree = create(
      <Button
        title={'Hello Primary'}
        accessibilityLabel={'primary'}
        onPress={() => {
          return
        }}
        buttonType={ButtonType.Primary}
      />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('Secondary renders correctly', () => {
    const tree = create(
      <Button
        title={'Hello Secondary'}
        accessibilityLabel={'secondary'}
        onPress={() => {
          return
        }}
        buttonType={ButtonType.Secondary}
      />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
