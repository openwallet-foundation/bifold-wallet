import { createContext, useContext } from 'react'

import { AnimatedComponents, animatedComponents } from '../animated-components'

export const AnimatedComponentsContext = createContext<AnimatedComponents>(animatedComponents)

export const AnimatedComponentsProvider = AnimatedComponentsContext.Provider

export const useAnimatedComponents = () => useContext(AnimatedComponentsContext)
