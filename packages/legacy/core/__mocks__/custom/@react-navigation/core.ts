const navigate = jest.fn()

const navigation = {
  navigate,
  setOptions: jest.fn(),
  getParent: jest.fn(() => ({
    navigate,
  })),
  getState: jest.fn(() => ({
    index: jest.fn(),
  })),
  goBack: jest.fn(),
  pop: jest.fn(),
  reset: jest.fn(),
}

const useNavigation = () => {
  return navigation
}

const useIsFocused = () => {
  return true
}

export { useNavigation, useIsFocused }
