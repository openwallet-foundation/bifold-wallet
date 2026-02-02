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

const useRoute = jest.fn().mockReturnValue({ params: {} })

const CommonActions = {
  navigate: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
}

const useFocusEffect = jest.fn((callback: () => void | (() => void)) => {
  // Execute the callback immediately to simulate focus
  const cleanup = callback()
  // Execute cleanup to simulate unfocus (for coverage)
  if (typeof cleanup === 'function') {
    cleanup()
  }
})
const createNavigatorFactory = jest.fn()

export { useNavigation, useIsFocused, useRoute, useFocusEffect, createNavigatorFactory, CommonActions }
