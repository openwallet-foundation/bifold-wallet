import { useState, useEffect, useMemo } from 'react'
import { useNavigationState } from '@react-navigation/native'
import { State } from '../types/state'
import { OnboardingTask } from '../types/navigators'
import { Config } from '../types/config'

/**
 * Hook to manage onboarding workflow state
 * Tracks the onboarding tasks, their completion status.
 */
export const useOnboardingState = (
  store: State,
  config: Config,
  termsVersion: number,
  generateOnboardingWorkflowSteps: (store: State, config: Config, termsVersion: number) => OnboardingTask[]
): {
  onboardingState: OnboardingTask[]
  setOnboardingState: React.Dispatch<React.SetStateAction<OnboardingTask[]>>
  activeScreen: string | undefined
  currentRoute: any
  isComplete: boolean
} => {
  const [onboardingState, setOnboardingState] = useState<OnboardingTask[]>([])
  const currentRoute = useNavigationState((state) => state?.routes[state?.index])

  const activeScreen = useMemo(() => {
    return onboardingState.find((task) => !task.completed)?.name
  }, [onboardingState])

  useEffect(() => {
    if (!store.stateLoaded) {
      return
    }

    const onboardingTasks = generateOnboardingWorkflowSteps(store, config, termsVersion)
    setOnboardingState(onboardingTasks)
  }, [store, config, termsVersion, generateOnboardingWorkflowSteps])

  return {
    onboardingState,
    setOnboardingState,
    activeScreen,
    currentRoute,
    isComplete: !activeScreen,
  }
}
