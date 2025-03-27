import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import DismissiblePopupModal from '../../App/components/modals/DismissiblePopupModal'
import { testIdWithKey } from '../../App/utils/testable'
import { BasicAppContext } from '../helpers/app'

const title = 'Test Title'
const description = 'Lorem ipsum sit dolar amet'

describe('DismissiblePopupModal Component', () => {
  test('Renders correctly without call to action', () => {
    const onDismissPressed = jest.fn()
    const tree = render(
      <BasicAppContext>
        <DismissiblePopupModal title={title} description={description} onDismissPressed={onDismissPressed} />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Renders correctly with call to action', () => {
    const onDismissPressed = jest.fn()
    const onCallToActionPressed = jest.fn()
    const tree = render(
      <BasicAppContext>
        <DismissiblePopupModal
          title={title}
          description={description}
          onDismissPressed={onDismissPressed}
          onCallToActionPressed={onCallToActionPressed}
        />
      </BasicAppContext>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Triggers call to action on press', () => {
    const onDismissPressed = jest.fn()
    const onCallToActionPressed = jest.fn()
    const { getByTestId } = render(
      <BasicAppContext>
        <DismissiblePopupModal
          title={title}
          description={description}
          onDismissPressed={onDismissPressed}
          onCallToActionPressed={onCallToActionPressed}
        />
      </BasicAppContext>
    )
    const okayButton = getByTestId(testIdWithKey('Okay'))
    fireEvent(okayButton, 'press')

    expect(onCallToActionPressed).toBeCalledTimes(1)
  })

  test('Triggers dismiss on press', () => {
    const onDismissPressed = jest.fn()
    const onCallToActionPressed = jest.fn()
    const { getByTestId } = render(
      <BasicAppContext>
        <DismissiblePopupModal
          title={title}
          description={description}
          onDismissPressed={onDismissPressed}
          onCallToActionPressed={onCallToActionPressed}
        />
      </BasicAppContext>
    )
    const dismissButton = getByTestId(testIdWithKey('Dismiss'))
    fireEvent(dismissButton, 'press')

    expect(onDismissPressed).toBeCalledTimes(1)
  })
})
