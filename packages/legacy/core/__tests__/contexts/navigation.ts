const actualNav = jest.requireActual('@react-navigation/native')
const navigate = jest.fn()

const navigationContext = {
  ...actualNav.navigation,
  navigate: navigate,
  dangerouslyGetState: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  isFocused: jest.fn(),
  getParent: () => {
    return navigationContext
  },
}

export default navigationContext
