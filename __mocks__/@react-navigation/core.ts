// const navigation = {}
// navigation.navigate = jest.fn()

const navigation = {
  navigate: jest.fn(),
}

const useNavigation = () => {
  return navigation
}

export { useNavigation }
