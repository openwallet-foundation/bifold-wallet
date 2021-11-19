import React from 'react'
import { View, Text } from 'react-native'
import { shadow } from '../../App/globalStyles'
import Icon from 'react-native-vector-icons/MaterialIcons'

export const toastConfig = {
  success: (props: any) => (
    <View
      style={{
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#2d6e35',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Icon name="check-circle" color="white" size={16} />
      <Text style={{ color: 'white', fontWeight: '500' }}> {props.text1}</Text>
    </View>
  ),
  error: (props: any) => (
    <View
      style={{
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#de3333',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Icon name="cancel" color="white" size={16} />
      <Text style={{ color: 'white', fontWeight: '500' }}> {props.text1}</Text>
    </View>
  ),
  info: (props: any) => (
    <View
      style={{
        padding: 15,
        borderRadius: 10,
        backgroundColor: shadow,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Icon name="alarm" color="white" size={16} />
      <Text style={{ color: 'white', fontWeight: '500' }}> {props.text1}</Text>
    </View>
  ),
}

export default toastConfig
