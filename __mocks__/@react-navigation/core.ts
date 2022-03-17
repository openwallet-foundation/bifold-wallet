const navigate = jest.fn()

const navigation = {
  navigate,
  goBack: jest.fn(),
  pop: jest.fn(),
  setOptions: jest.fn(),
  getParent: jest.fn(() => ({
    navigate,
  })),
}

const useNavigation = () => {
  return navigation
}

export { useNavigation }
