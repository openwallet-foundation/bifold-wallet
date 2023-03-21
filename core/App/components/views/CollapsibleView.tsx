import React, { forwardRef, PropsWithChildren, useImperativeHandle, useState } from 'react'
import Collapsible, { CollapsibleProps } from 'react-native-collapsible'

interface CollapsibleViewProps {
  collapsibleProps?: CollapsibleProps
  initialOpened?: boolean
}

export interface CollapsibleViewRef {
  toggle: () => void
}

const CollapsibleView = forwardRef<CollapsibleViewRef | null, PropsWithChildren<CollapsibleViewProps>>((props, ref) => {
  const [opened, setOpened] = useState(!!props.initialOpened)

  const toggle = () => setOpened(!opened)

  useImperativeHandle(
    ref,
    () => {
      return { toggle }
    },
    [toggle]
  )

  return (
    <Collapsible collapsed={!opened} enablePointerEvents={true} {...props.collapsibleProps}>
      {props.children}
    </Collapsible>
  )
})

export default CollapsibleView
