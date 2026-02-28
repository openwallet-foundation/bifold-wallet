const Orientation = {
  initialOrientation: 'PORTRAIT',
  lockToPortrait: jest.fn(),
  lockToLandscape: jest.fn(),
  unlockAllOrientations: jest.fn(),
  addOrientationListener: jest.fn(),
  removeOrientationListener: jest.fn(),
}

const useOrientationChange = jest.fn()

enum OrientationType {
  PORTRAIT = 'PORTRAIT',
  PORTRAIT_UPSIDEDOWN = 'PORTRAIT-UPSIDEDOWN',
  LANDSCAPE_LEFT = 'LANDSCAPE-LEFT',
  LANDSCAPE_RIGHT = 'LANDSCAPE-RIGHT',
}

export default Orientation
export { Orientation, useOrientationChange, OrientationType }
