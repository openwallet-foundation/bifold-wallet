import { render } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import RecordField from '../../src/components/record/RecordField'
import { hiddenFieldValue } from '../../src/constants'
import { testIdWithKey } from '../../src/utils/testable'
import { CaptureBaseAttributeType } from '@hyperledger/aries-oca'
import { BasicAppContext } from '../helpers/app'

const base64ImagePath = path.join(__dirname, '../fixtures/base64-image.txt')
const base64Image = fs.readFileSync(base64ImagePath, 'utf8')

const defaultField = {
  name: 'Test',
  credentialId: 'test',
  label: 'Test',
  value: 'Test',
}

describe('RecordField Component', () => {
  test('Hidden normal field', async () => {
    const tree = render(
      <BasicAppContext>
        <RecordField field={defaultField} shown={false} />
      </BasicAppContext>
    )
    const hiddenFieldText = tree.getByTestId(testIdWithKey('AttributeValue'))

    expect(hiddenFieldText.children[0]).toEqual(hiddenFieldValue)
  })

  test('Hidden binary field', async () => {
    const binaryField = { ...defaultField, encoding: 'base64', format: 'image/png' }
    const tree = render(
      <BasicAppContext>
        <RecordField field={binaryField} shown={false} />
      </BasicAppContext>
    )
    const hiddenFieldText = tree.getByTestId(testIdWithKey('AttributeValue'))

    expect(hiddenFieldText.children[0]).toEqual(hiddenFieldValue)
  })

  test('Hidden date field ', async () => {
    const dateField = { ...defaultField, type: CaptureBaseAttributeType.DateInt }
    const tree = render(
      <BasicAppContext>
        <RecordField field={dateField} shown={false} />
      </BasicAppContext>
    )
    const hiddenFieldText = tree.getByTestId(testIdWithKey('AttributeValue'))

    expect(hiddenFieldText.children[0]).toEqual(hiddenFieldValue)
  })

  test('Shown normal field should render value', async () => {
    const tree = render(
      <BasicAppContext>
        <RecordField field={defaultField} shown={true} />
      </BasicAppContext>
    )
    const hiddenFieldText = tree.getByTestId(testIdWithKey('AttributeValue'))

    expect(hiddenFieldText.children[0]).toEqual('Test')
  })

  test('Shown binary field should render a binary field', async () => {
    const binaryField = {
      ...defaultField,
      encoding: 'base64',
      format: 'image/png',
      value: base64Image,
    }
    const tree = render(
      <BasicAppContext>
        <RecordField field={binaryField} shown={true} />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Shown date field should render a date field', async () => {
    const dateField = {
      ...defaultField,
      type: CaptureBaseAttributeType.DateInt,
      value: 20000101,
    }
    const tree = render(
      <BasicAppContext>
        <RecordField field={dateField} shown={true} />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })
})
