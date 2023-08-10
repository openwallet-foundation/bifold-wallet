import React from 'react'
import { View } from 'react-native'

interface HomeHeaderViewProps {
  children?: any
}

const HomeHeaderView: React.FC<HomeHeaderViewProps> = ({ children }) => {
  return <View>{children}</View>
}

export default HomeHeaderView
