import React from 'react'

const Constants = {
  device: {},
  torch: {
    on: 'on',
    off: 'off',
    auto: 'auto',
  },
  isActive: false,
  codeScanner: {},
}

class Camera extends React.Component {
  static Constants = Constants
  render() {
    return null
  }
}

Camera.Constants = Constants
const useCameraDevice = jest.fn()
const useCodeScanner = jest.fn()
const useCameraFormat = jest.fn()
export { Camera, useCameraDevice, useCodeScanner, useCameraFormat }
