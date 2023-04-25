import React, { cloneElement, ReactElement, ReactNode, RefObject, useContext, useEffect, useRef } from 'react'
import { StyleProp, View } from 'react-native'

import { TourContext } from '../../contexts/tour/tour-context'
import { testIdWithKey } from '../../utils/testable'

export interface ChildProps<T> {
  children?: ReactNode
  ref: RefObject<unknown>
  style: StyleProp<T>
}

export interface AttachTourStepProps<T> {
  children: ReactElement<ChildProps<T>>
  /**
   * When `AttachTourStep` wraps a Functional Component, it needs to add an
   * aditional `View` on top of it to be able to measure the layout upon
   * render. This prop allows to define the behavior of the width of such
   * `View`. When set to `false`, it adjusts to its contents, when set to
   * `true`, it stretches out and tries to fill it view.
   *
   * **Note:** This prop has no effect when wrapping native components or
   * componentes created with `React.forwardRef`, which pass the `ref` to
   * another native component.
   *
   * @default false
   */
  fill?: boolean
  /**
   * The index of the `steps` array to which the step is attatched to.
   */
  index: number
}

/**
 * React functional component used to attach and step to another component by
 * only wrapping it. Use its props to customize the behavior.
 *
 * @param props the component props
 * @returns an AttachTourStep React element
 */
export function AttachTourStep<T>({ children, fill = false, index }: AttachTourStepProps<T>): ReactElement {
  const { current, changeSpot } = useContext(TourContext)

  const childRef = useRef<View>(null)

  useEffect(() => {
    if (current === index) {
      childRef.current?.measureInWindow((x, y, width, height) => {
        changeSpot({ height, width, x, y })
      })
    }
  }, [changeSpot, current, index])

  const { style, ...rest } = children.props
  const childStyle = style ?? {}
  return (
    <View
      testID={testIdWithKey('AttachTourStep')}
      ref={childRef}
      style={{ alignSelf: fill ? 'stretch' : 'center', ...childStyle }}
      collapsable={false}
      focusable={false}
    >
      {cloneElement(children, rest, children.props?.children)}
    </View>
  )
}
