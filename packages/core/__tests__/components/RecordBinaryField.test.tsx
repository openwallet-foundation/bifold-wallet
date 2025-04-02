import { render } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'

import RecordBinaryField from '../../src/components/record/RecordBinaryField'
import { hiddenFieldValue } from '../../src/constants'
import { testIdWithKey } from '../../src/utils/testable'

const base64ImagePath = path.join(__dirname, '../fixtures/base64-image.txt')
const base64Image = fs.readFileSync(base64ImagePath, 'utf8')

describe('RecordBinaryField Component', () => {
  test('Base64 render field value as image', async () => {
    const tree = render(<RecordBinaryField attributeValue={base64Image} shown={true} />)

    expect(tree).toMatchSnapshot()
  })
  test('Hidden field', async () => {
    const tree = render(<RecordBinaryField attributeValue={''} shown={false} />)

    const hiddenFieldText = tree.getByTestId(testIdWithKey('AttributeValue'))

    expect(hiddenFieldText.children[0]).toEqual(hiddenFieldValue)
  })
})
