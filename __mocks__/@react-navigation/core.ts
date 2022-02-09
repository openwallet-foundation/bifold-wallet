const navigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  pop: jest.fn(),
}

const useNavigation = () => {
  return navigation
}

export { useNavigation }
