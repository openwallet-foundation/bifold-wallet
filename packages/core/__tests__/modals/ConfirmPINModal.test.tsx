import { render } from '@testing-library/react-native'
import React from 'react'

import ConfirmPINModal, { ConfirmPINModalUsage } from '../../src/components/modals/ConfirmPINModal'
import { BasicAppContext } from '../helpers/app'

describe('ConfirmPINModal Component', () => {
  test('Renders correctly for PIN change', async () => {
    const tree = render(
      <BasicAppContext>
        <ConfirmPINModal
          modalUsage={ConfirmPINModalUsage.PIN_CHANGE}
          onBackPressed={jest.fn()}
          onConfirmPIN={jest.fn()}
          title="Title"
          visible={true}
          isLoading={false}
        />
      </BasicAppContext>
    )
    expect(tree).toMatchSnapshot()
  })
  test('Renders correctly for PIN create', async () => {
    const tree = render(
      <BasicAppContext>
        <ConfirmPINModal
          modalUsage={ConfirmPINModalUsage.PIN_CREATE}
          onBackPressed={jest.fn()}
          onConfirmPIN={jest.fn()}
          title="Title"
          visible={true}
          isLoading={false}
        />
      </BasicAppContext>
    )
    expect(tree).toMatchSnapshot()
  })
})
