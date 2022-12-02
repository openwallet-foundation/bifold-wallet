import { render } from '@testing-library/react-native'
import React from 'react'

import BaseToast, { ToastType } from '../../App/components/toast/BaseToast'

describe('BaseToast Component', () => {
  test('Info renders correctly', () => {
    const tree = render(
      <BaseToast
        title={'Hello World'}
        body={'The quick brown fox jumped over the lazy dog'}
        toastType={ToastType.Info}
      />
    )

    expect(tree).toMatchSnapshot()
  })

  test('Success renders correctly', () => {
    const tree = render(
      <BaseToast
        title={'Hello World'}
        body={'The quick brown fox jumped over the lazy dog'}
        toastType={ToastType.Success}
      />
    )

    expect(tree).toMatchSnapshot()
  })

  test('Warn renders correctly', () => {
    const tree = render(
      <BaseToast
        title={'Hello World'}
        body={'The quick brown fox jumped over the lazy dog'}
        toastType={ToastType.Warn}
      />
    )

    expect(tree).toMatchSnapshot()
  })

  test('Error renders correctly', () => {
    const tree = render(
      <BaseToast
        title={'Hello World'}
        body={'The quick brown fox jumped over the lazy dog'}
        toastType={ToastType.Error}
      />
    )

    expect(tree).toMatchSnapshot()
  })
})
