import { useState, useEffect, useMemo } from 'react'
import { useNavigationState } from '@react-navigation/native'
import { State } from '../types/state'
import { OnboardingTask } from '../types/navigators'
import { Config } from '../types/config'

export const useOnboardingState = (
  store: State,
  config: Config,
  termsVersion: number,
  generateOnboardingWorkflowSteps: (store: State, config: Config, termsVersion: number) => OnboardingTask[]
) => {
  const [localState, setLocalState] = useState<OnboardingTask[]>([])
  const currentRoute = useNavigationState((state) => state?.routes[state?.index])

  const activeScreen = useMemo(() => {
    return localState.find((s) => !s.completed)?.name
  }, [localState])

  useEffect(() => {
    if (!store.stateLoaded) {
      return
    }

    const screens = generateOnboardingWorkflowSteps(store, config, termsVersion)
    setLocalState(screens)
  }, [store.stateLoaded, store.onboarding, store.authentication, config, termsVersion, generateOnboardingWorkflowSteps])

  return {
    localState,
    setLocalState,
    activeScreen,
    currentRoute,
    isComplete: !activeScreen,
  }
}
