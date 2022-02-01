import React from 'react'
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Colors, TextTheme, borderRadius } from '../../theme'

interface ToastProps {
  title: string
  body: string
  backgroundColor: string
  icon: string
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginTop: 25,
    borderRadius,
  },
  icon: {
    marginTop: 15,
    marginHorizontal: 15,
  },
  text: {
    flexShrink: 1,
    marginVertical: 15,
    marginRight: 10,
  },
  title: {
    color: '#2D4821',
    fontWeight: 'bold',
  },
  body: {
    marginTop: 10,
    color: '#2D4821',
  },
})

const BaseToast: React.FC<ToastProps> = ({ title, body, backgroundColor, icon }) => {
  const { width } = useWindowDimensions()

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor, width: width - width * 0.1 }]}>
      <Icon style={[styles.icon]} name={icon} color={Colors.text} size={24} />
      <View style={[styles.text]}>
        <Text style={[TextTheme.normal, styles.title]}>{title}</Text>
        <Text style={[TextTheme.normal, styles.body]}>{body}</Text>
      </View>
    </View>
  )
}

export default BaseToast
