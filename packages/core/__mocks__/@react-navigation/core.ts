const navigate = jest.fn()
const dispatch = jest.fn()
const replace = jest.fn()
const navigation = {
  __timestamp: process.hrtime(),
  navigate,
  replace,
  setOptions: jest.fn(),
  getParent: () => {
    return {
      navigate,
      dispatch,
      replace,
    }
  },
  getState: jest.fn(() => ({
    index: jest.fn(),
  })),
  goBack: jest.fn(),
  pop: jest.fn(),
  reset: jest.fn(),
  isFocused: () => true,
  dispatch,
}

const useNavigation = () => {
  return navigation
}

const useIsFocused = () => {
  return true
}

const CommonActions = {
  navigate: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
}

export { useNavigation, useIsFocused, CommonActions }
