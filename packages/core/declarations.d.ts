declare module '*.svg' {
  import { SvgProps } from 'react-native-svg'
  import type { FC } from 'react'
  const content: FC<SvgProps>
  export default content
}

declare module '@react-native-community/netinfo/jest/netinfo-mock'
