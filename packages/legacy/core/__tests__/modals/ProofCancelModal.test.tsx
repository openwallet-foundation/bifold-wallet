import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import ProofCancelModal from '../../App/components/modals/ProofCancelModal'
import { testIdWithKey } from '../../App/utils/testable'
import { BasicAppContext } from '../helpers/app'

describe('ProofCancelModal Component', () => {
  test('Rerenders correctly when not visible', async () => {
    const tree = render(
      <BasicAppContext>
        <ProofCancelModal visible={true} onDone={jest.fn()} />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Done button triggers callback', async () => {
    const onDone = jest.fn()
    const tree = render(
      <BasicAppContext>
        <ProofCancelModal onDone={onDone} visible={true} />
      </BasicAppContext>
    )

    const doneButton = tree.getByTestId(testIdWithKey('Done'))

    fireEvent(doneButton, 'press')

    expect(onDone).toBeCalledTimes(1)
  })
})
