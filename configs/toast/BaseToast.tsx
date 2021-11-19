import React from 'react'
import { View, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useWindowDimensions } from 'react-native'

interface Props {
  title: string
  backgroundColor: string
  icon: string
}

const BaseToast: React.FC<Props> = ({ title, backgroundColor, icon }) => {
  const { width } = useWindowDimensions()
  return (
    <View
      style={{
        padding: 20,
        borderRadius: 10,
        backgroundColor: backgroundColor,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        width: width - 30,
      }}
    >
      <Icon name={icon} color="white" size={16} />
      <Text style={{ color: 'white', fontWeight: '500' }}> {title}</Text>
    </View>
  )
}

export default BaseToast
