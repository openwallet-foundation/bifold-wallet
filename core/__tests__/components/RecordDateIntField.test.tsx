import { render } from '@testing-library/react-native'
import React from 'react'

import RecordDateIntField from '../../App/components/record/RecordDateIntField'
import { lengthOfhiddenAttributes } from '../../App/constants'
import { testIdWithKey } from '../../App/utils/testable'

describe('Record DateInt Field Component', () => {
  it('Invalid dateInt render field value as is', async () => {
    const field = {
      name: 'Test',
      format: 'YYYY-MM-DD',
      type: 'DateInt',
      value: 'invalid date',
    }
    const tree = render(<RecordDateIntField field={field} shown={true} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
  it('Invalid dateInt render should equal field value', async () => {
    const field = {
      name: 'Test',
      format: 'YYYY-MM-DD',
      type: 'DateInt',
      value: 'invalid date',
    }
    const tree = render(<RecordDateIntField field={field} shown={true} />)
    const fieldValueText = tree.getByTestId(testIdWithKey('AttributeValue'))

    expect(fieldValueText.children[0]).toEqual(field.value)
  })
  it('Valid dateInt render field value in format', async () => {
    const field = {
      name: 'Test',
      format: 'YY-MM-DD',
      type: 'DateInt',
      value: '20000101',
    }
    const tree = render(<RecordDateIntField field={field} shown={true} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
  it('Valid dateInt and date format with only year should render only field value year', async () => {
    const field = {
      name: 'Test',
      format: 'YYYY',
      type: 'DateInt',
      value: '20000101',
    }
    const tree = render(<RecordDateIntField field={field} shown={true} />)
    const fieldValueText = tree.getByTestId(testIdWithKey('AttributeValue'))

    expect(fieldValueText.children[0]).toEqual(field.value.substring(0, 4))
  })
  it('Valid dateInt and random date format should render field value in random format', async () => {
    const field = {
      name: 'Test',
      format: 'YYYY re',
      type: 'DateInt',
      value: '20000101',
    }
    const tree = render(<RecordDateIntField field={field} shown={true} />)
    const fieldValueText = tree.getByTestId(testIdWithKey('AttributeValue'))

    expect(fieldValueText.children[0]).toEqual(field.value.substring(0, 4) + ' re')
  })
  it('Hidden field', async () => {
    const field = {
      name: 'Test',
      format: 'YY-MM-DD',
      type: 'DateInt',
      value: '20000101',
    }
    const tree = render(<RecordDateIntField field={field} shown={false} />)

    const hiddenFieldText = tree.getByTestId(testIdWithKey('AttributeValue'))

    expect(hiddenFieldText.children[0]).toEqual(Array(lengthOfhiddenAttributes).fill('\u2022').join(''))
  })
})
