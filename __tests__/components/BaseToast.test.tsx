import React from 'react'
import { create } from 'react-test-renderer'

import BaseToast, { ToastType } from '../../App/components/toast/BaseToast'

describe('BaseToast Component', () => {
  it('Info renders correctly', () => {
    const tree = create(
      <BaseToast
        title={'Hello World'}
        body={'The quick brown fox jumped over the lazy dog'}
        toastType={ToastType.Info}
      />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('Success renders correctly', () => {
    const tree = create(
      <BaseToast
        title={'Hello World'}
        body={'The quick brown fox jumped over the lazy dog'}
        toastType={ToastType.Success}
      />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('Warn renders correctly', () => {
    const tree = create(
      <BaseToast
        title={'Hello World'}
        body={'The quick brown fox jumped over the lazy dog'}
        toastType={ToastType.Warn}
      />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('Error renders correctly', () => {
    const tree = create(
      <BaseToast
        title={'Hello World'}
        body={'The quick brown fox jumped over the lazy dog'}
        toastType={ToastType.Error}
      />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
