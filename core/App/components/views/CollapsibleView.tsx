import React, { forwardRef, PropsWithChildren, useImperativeHandle, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Collapsible, { CollapsibleProps } from 'react-native-collapsible'
import { SvgXml } from 'react-native-svg'

interface CollapsibleViewProps {
  collapsibleProps?: CollapsibleProps
  initialOpened?: boolean
}

export interface CollapsibleViewRef {
  toggle: () => void
}

const styles = StyleSheet.create({
  gradientContainer: { position: 'absolute', top: 0, width: '100%', height: '100%' },
})

const gradientSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600px" height="200px" >
  <defs>
   <linearGradient id="lgrad" x1="50%" y1="0%" x2="50%" y2="100%" >

          <stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0.3" />
          <stop offset="50%" style="stop-color:rgb(255,255,255);stop-opacity:0.5" />
          <stop offset="80%" style="stop-color:rgb(255,255,255);stop-opacity:0.9" />

    </linearGradient>
  </defs>
  <rect x="0" y="0" width="100%" height="100%" fill="url(#lgrad)"/>
</svg>`

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
      <View>
        {props.children}
        {!opened && props.collapsibleProps?.collapsedHeight && (
          <View style={styles.gradientContainer}>
            <SvgXml xml={gradientSVG} width={'100%'} height={props.collapsibleProps.collapsedHeight} />
          </View>
        )}
      </View>
    </Collapsible>
  )
})

export default CollapsibleView
