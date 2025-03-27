import { render } from '@testing-library/react-native'
import React from 'react'

import BaseToast, { ToastType } from '../../App/components/toast/BaseToast'
import { BasicAppContext } from '../helpers/app'

describe('BaseToast Component', () => {
  test('Info renders correctly', () => {
    const tree = render(
      <BasicAppContext>
        <BaseToast
          title={'Hello World'}
          body={'The quick brown fox jumped over the lazy dog'}
          toastType={ToastType.Info}
        />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Success renders correctly', () => {
    const tree = render(
      <BasicAppContext>
        <BaseToast
          title={'Hello World'}
          body={'The quick brown fox jumped over the lazy dog'}
          toastType={ToastType.Success}
        />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Warn renders correctly', () => {
    const tree = render(
      <BasicAppContext>
        <BaseToast
          title={'Hello World'}
          body={'The quick brown fox jumped over the lazy dog'}
          toastType={ToastType.Warn}
        />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Error renders correctly', () => {
    const tree = render(
      <BasicAppContext>
        <BaseToast
          title={'Hello World'}
          body={'The quick brown fox jumped over the lazy dog'}
          toastType={ToastType.Error}
        />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Toast Renders without body text', () => {
    const tree = render(
      <BasicAppContext>
        <BaseToast title={'Hello World'} toastType={ToastType.Error} />
      </BasicAppContext>
    )
    const bodyText = tree.queryByTestId('ToastBody')
    expect(bodyText).toBeNull()
  })
})
