import { render, fireEvent, act } from '@testing-library/react-native'
import React from 'react'

import ErrorModal from '../../src/components/modals/ErrorModal'
import * as themeContext from '../../src/contexts/theme' // note we're importing with a * to import all the exports
import { DeviceEventEmitter } from 'react-native'
import { EventTypes } from '../../src/constants'
import { BasicAppContext } from '../helpers/app'
import { mockThemeContext } from '../contexts/theme'

describe('ErrorModal Component', () => {
  beforeAll(() => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => mockThemeContext)
  })
  test('Renders correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <ErrorModal />
      </BasicAppContext>
    )
    act(() => {
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, { title: 'title', message: 'message', code: 123 })
    })
    expect(await tree.findByText('Global.Okay')).not.toBeNull()
    expect(tree).toMatchSnapshot()
  })

  test('Dismiss on demand', async () => {
    const tree = render(
      <BasicAppContext>
        <ErrorModal />
      </BasicAppContext>
    )
    act(() => {
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, { title: 'Error.Unknown', message: 'Error.Problem', code: 123 })
    })

    //tree.debug()
    await act(async () => {
      const dismissBtn = await tree.findByText('Global.Okay')
      fireEvent(dismissBtn, 'press')
    })
    expect(tree).toMatchSnapshot()
  })
})
