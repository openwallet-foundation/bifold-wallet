import { act, render } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import RecordField from '../../App/components/record/RecordField'
import { hiddenFieldValue } from '../../App/constants'
import { BaseType } from '../../App/types/oca'
import { testIdWithKey } from '../../App/utils/testable'

const base64ImagePath = path.join(__dirname, '../fixtures/base64-image.txt')
const base64Image = fs.readFileSync(base64ImagePath, 'utf8')

const defaultField = {
  name: 'Test',
  credentialId: 'test',
  label: 'Test',
  value: 'Test',
}

describe('Record Field Component', () => {
  it('Hidden normal field', async () => {
    const tree = render(<RecordField field={defaultField} shown={false} />)

    const hiddenFieldText = tree.getByTestId(testIdWithKey('AttributeValue'))

    expect(hiddenFieldText.children[0]).toEqual(hiddenFieldValue)
  })
  it('Hidden binary field', async () => {
    const binaryField = { ...defaultField, encoding: 'base64', format: 'image/png' }

    const tree = render(<RecordField field={binaryField} shown={false} />)

    const hiddenFieldText = tree.getByTestId(testIdWithKey('AttributeValue'))

    expect(hiddenFieldText.children[0]).toEqual(hiddenFieldValue)
  })
  it('Hidden date field ', async () => {
    const dateField = { ...defaultField, type: BaseType.DATEINT }

    const tree = render(<RecordField field={dateField} shown={false} />)

    const hiddenFieldText = tree.getByTestId(testIdWithKey('AttributeValue'))

    expect(hiddenFieldText.children[0]).toEqual(hiddenFieldValue)
  })
  it('Shown normal field should render value', async () => {
    const tree = render(<RecordField field={defaultField} shown={true} />)

    const hiddenFieldText = tree.getByTestId(testIdWithKey('AttributeValue'))

    expect(hiddenFieldText.children[0]).toEqual('Test')
  })
  it('Shown binary field should render a binary field', async () => {
    const binaryField = {
      ...defaultField,
      encoding: 'base64',
      format: 'image/png',
      value: base64Image,
    }

    const tree = render(<RecordField field={binaryField} shown={true} />)

    expect(tree).toMatchSnapshot()
  })
  it('Shown date field should render a date field', async () => {
    const dateField = {
      ...defaultField,
      type: BaseType.DATEINT,
      value: 20000101,
    }

    act(async () => {
      const tree = render(<RecordField field={dateField} shown={true} />)

      expect(tree).toMatchSnapshot()
    })
  })
})
