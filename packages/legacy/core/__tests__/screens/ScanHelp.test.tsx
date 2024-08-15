import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import ScanHelp from '../../App/screens/ScanHelp'
import { testIdWithKey } from '../../App/utils/testable'
import { BasicAppContext } from '../helpers/app'

describe('ScanHelp Screen', () => {
  test('Renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <ScanHelp />
      </BasicAppContext>
    )
    expect(tree).toMatchSnapshot()
  })

  test('Link button exists and is accessible', async () => {
    const tree = render(
      <BasicAppContext>
        <ScanHelp />
      </BasicAppContext>
    )
    const { getByTestId } = tree
    const linkButton = getByTestId(testIdWithKey('WhereToUseLink'))

    fireEvent(linkButton, 'press')

    expect(linkButton).toBeTruthy()
  })
})
