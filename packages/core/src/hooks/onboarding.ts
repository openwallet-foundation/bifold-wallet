import { useCallback } from 'react'
import { useNavigation } from '@react-navigation/core'
import { useStore } from '../contexts/store'

export const useGotoPostAuthScreens = () => {
  const [store] = useStore()
  const navigation = useNavigation()
  return useCallback(() => {
    if (store.onboarding.postAuthScreens.length) {
      const screen = store.onboarding.postAuthScreens[0]
      if (screen) {
        navigation.navigate(screen as never)
      }
    }
  }, [store.onboarding.postAuthScreens, navigation])
}
