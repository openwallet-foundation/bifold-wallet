/**
 * @format
 */

import 'react-native'
import React from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import renderer from 'react-test-renderer'

import App from '../App'

// Note: test renderer must be required after react-native.

it('renders correctly', () => {
  renderer.create(<App />)
})
