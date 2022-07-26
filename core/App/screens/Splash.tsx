import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useMemo } from 'react'
import { Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { LocalStorageKeys } from '../constants'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { AuthenticateStackParams, Screens } from '../types/navigators'
import { Onboarding as StoreOnboardingState } from '../types/state'

const onboardingComplete = (state: StoreOnboardingState): boolean => {
  return state.didCompleteTutorial && state.didAgreeToTerms && state.didCreatePIN
}

const resumeOnboardingAt = (state: StoreOnboardingState): Screens => {
  if (state.didCompleteTutorial && state.didAgreeToTerms && !state.didCreatePIN) {
    return Screens.CreatePin
  }

  if (state.didCompleteTutorial && !state.didAgreeToTerms) {
    return Screens.Terms
  }

  return Screens.Onboarding
}
/*
  To customize this splash screen set the background color of the
  iOS and Android launch screen to match the background color of
  of this view.
*/

const Splash: React.FC = () => {
  const [, dispatch] = useStore()
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const { ColorPallet, Assets } = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
  })
  useMemo(() => {
    async function init() {
      try {
        // await AsyncStorage.removeItem(LocalStorageKeys.Onboarding)
        const data = await AsyncStorage.getItem(LocalStorageKeys.Onboarding)
        if (data) {
          const onboardingState = JSON.parse(data) as StoreOnboardingState
          dispatch({ type: DispatchAction.ONBOARDING_UPDATED, payload: [onboardingState] })
          if (onboardingComplete(onboardingState)) {
            navigation.navigate(Screens.EnterPin)
          } else {
            // If onboarding was interrupted we need to pickup from where we left off.
            const destination = resumeOnboardingAt(onboardingState)
            // @ts-ignore
            navigation.navigate({ name: destination })
          }
          return
        }
        // We have no onboarding state, starting from step zero.
        navigation.navigate(Screens.Onboarding)
      } catch (error) {
        // TODO:(am add error handling here)
      }
    }
    init()
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <Image source={Assets.img.logoSecondary.src} style={{ resizeMode: Assets.img.logoSecondary.resizeMode }} />
    </SafeAreaView>
  )
}

export default Splash
