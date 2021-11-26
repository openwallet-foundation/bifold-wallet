import React from 'react'
import renderer from 'react-test-renderer'

import App from '../App'

describe('App', () => {
  // beforeEach(() => {
  //   // Alternatively, set "clearMocks" in your Jest config to "true"
  //   mockedDispatch.mockClear()
  // })

  it.skip('renders correctly', () => {
    const tree = renderer.create(<App />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
