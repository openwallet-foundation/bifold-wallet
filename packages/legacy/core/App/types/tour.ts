import { ReactNode } from 'react'

/**
 * Makes the target optional. I.e, it can be the target type or `undefined`.
 */
export type Optional<T> = T | undefined

/**
 * An alias of what a React child looks when passed as function.
 */
export type ChildFn<T> = (value: T) => ReactNode
