// import { useFocusEffect } from '@react-navigation/native'

const useFocusEffect = jest.fn()
const createNavigatorFactory = jest.fn()

const CommonActions = {
  reset: jest.fn(),
}

const useIsFocused = () => {
  return true
}

export { useIsFocused, useFocusEffect, createNavigatorFactory, CommonActions }
