import { render } from '@testing-library/react-native'
import React from 'react'

import RecordDateIntField from '../../App/components/record/RecordDateIntField'
import { hiddenFieldValue } from '../../App/constants'
import { testIdWithKey } from '../../App/utils/testable'

describe('Record DateInt Field Component', () => {
  test('Invalid dateInt render field value as is', async () => {
    const field = {
      name: 'Test',
      format: 'YYYY-MM-DD',
      type: 'DateInt',
      value: 'invalid date',
    }
    const tree = render(<RecordDateIntField field={field} shown={true} />)

    expect(tree).toMatchSnapshot()
  })
})
test('Valid dateInt render field value in format', async () => {
  const field = {
    name: 'Test',
    format: 'YY-MM-DD',
    type: 'DateInt',
    value: '20000101',
  }
  const tree = render(<RecordDateIntField field={field} shown={true} />)

  expect(tree).toMatchSnapshot()
})
test('Hidden field should render hidden value', async () => {
  const field = {
    name: 'Test',
    format: 'YY-MM-DD',
    type: 'DateInt',
    value: '20000101',
  }
  const tree = render(<RecordDateIntField field={field} shown={false} />)

  const hiddenFieldText = tree.getByTestId(testIdWithKey('AttributeValue'))

  expect(hiddenFieldText.children[0]).toEqual(hiddenFieldValue)
})
