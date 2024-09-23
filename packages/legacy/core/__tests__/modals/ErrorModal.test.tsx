import { render, fireEvent, act } from '@testing-library/react-native'
import React from 'react'

import ErrorModal from '../../App/components/modals/ErrorModal'
import * as themeContext from '../../App/contexts/theme' // note we're importing with a * to import all the exports
import { theme } from '../../App/theme'
import { DeviceEventEmitter } from 'react-native'
import { EventTypes } from '../../App/constants'
import { BasicAppContext } from '../helpers/app'


describe('ErrorModal Component', () => {
  test('Renders correctly', async () => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => theme)
    const tree = render(<BasicAppContext><ErrorModal /></BasicAppContext>)
    act(() => {
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, { title: 'title', message: 'message', code: 123 })
    })
    expect(await tree.findByText('Global.Okay')).not.toBeNull()
    expect(tree).toMatchSnapshot()
  })

  test('Dismiss on demand', async () => {
    jest.spyOn(themeContext, 'useTheme').mockImplementation(() => theme)
    const tree = render(<BasicAppContext><ErrorModal /></BasicAppContext>)
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
