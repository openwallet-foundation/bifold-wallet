import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import InfoBox, { InfoBoxType } from '../../src/components/misc/InfoBox'
import { BasicAppContext } from '../helpers/app'

const callToAction = jest.fn()

describe('InfoBox Component', () => {
  test('Renders correctly as Info', async () => {
    const tree = render(
      <BasicAppContext>
        <InfoBox
          notificationType={InfoBoxType.Info}
          title={'Hello Title'}
          message={'The quick brown fox jumped over the lazy dog.'}
          onCallToActionPressed={callToAction}
        />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
    expect(callToAction).not.toBeCalled()
  })

  test('Renders correctly as Success', async () => {
    const tree = render(
      <BasicAppContext>
        <InfoBox
          notificationType={InfoBoxType.Success}
          title={'Hello Title'}
          message={'The quick brown fox jumped over the lazy dog.'}
          onCallToActionPressed={callToAction}
        />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
    expect(callToAction).not.toBeCalled()
  })

  test('Renders correctly as Warning', async () => {
    const tree = render(
      <BasicAppContext>
        <InfoBox
          notificationType={InfoBoxType.Warn}
          title={'Hello Title'}
          message={'The quick brown fox jumped over the lazy dog.'}
          onCallToActionPressed={callToAction}
        />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
    expect(callToAction).not.toBeCalled()
  })

  test('Renders correctly as Error', async () => {
    const tree = render(
      <BasicAppContext>
        <InfoBox
          notificationType={InfoBoxType.Error}
          title={'Hello Title'}
          message={'The quick brown fox jumped over the lazy dog.'}
          onCallToActionPressed={callToAction}
        />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
    expect(callToAction).not.toBeCalled()
  })

  test('Hides optional components when empty', async () => {
    const tree = render(
      <BasicAppContext>
        <InfoBox
          notificationType={InfoBoxType.Error}
          title={'Hello Title'}
          message={'The quick brown fox jumped over the lazy dog.'}
        />
      </BasicAppContext>
    )

    expect(tree.queryByText('Global.ErrorCode')).toBeNull()
    expect(tree.queryByText('Global.Okay')).toBeNull()
  })

  test('Callback triggered', async () => {
    const tree = render(
      <BasicAppContext>
        <InfoBox
          notificationType={InfoBoxType.Info}
          title={'Hello Title'}
          message={'The quick brown fox jumped over the lazy dog.'}
          onCallToActionPressed={callToAction}
        />
      </BasicAppContext>
    )

    const dismissBtn = await tree.findByText('Global.Okay')
    fireEvent(dismissBtn, 'press')

    expect(callToAction).toBeCalledTimes(1)
  })
})
