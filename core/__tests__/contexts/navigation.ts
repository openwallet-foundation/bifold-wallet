const actualNav = jest.requireActual('@react-navigation/native')
const navigate = jest.fn()

const navigationContext = {
  ...actualNav.navigation,
  navigate: navigate,
  dangerouslyGetState: () => {},
  setOptions: () => {},
  addListener: () => () => {},
  isFocused: () => true,
  getParent: () => {
    return navigationContext
  },
}

export default navigationContext
