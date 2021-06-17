import React from 'react'

import { Text, TouchableOpacity, View, StyleSheet } from 'react-native'

import { useHistory } from 'react-router-native'

import AppStyles from '../../assets/styles'
import Styles from './Message/styles'

interface IMessage {
  bgColor: string
  title: string
  textLight: string
  text: string
  path: string
  children: JSX.Element[]
}

function Message(props: IMessage) {
  const history = useHistory()

  return (
    <View style={Styles.msgView}>
      <View
        style={[Styles.innerView, props.bgColor ? { backgroundColor: props.bgColor } : { backgroundColor: '#fff' }]}
      >
        {props.children}
        {props.title ? (
          <Text
            style={[
              AppStyles.h2,
              AppStyles.textBold,
              { marginTop: 25 },
              props.textLight ? AppStyles.textWhite : AppStyles.textSecondary,
            ]}
          >
            {props.title}
            {'\n'}
          </Text>
        ) : null}
        {props.text ? (
          <Text style={[Styles.msgText, props.textLight ? AppStyles.textWhite : AppStyles.textSecondary]}>
            {props.text}
            {'\n'}
          </Text>
        ) : null}
        {props.path ? (
          <TouchableOpacity
            style={[AppStyles.button, AppStyles.backgroundPrimary, { marginTop: 30 }]}
            onPress={() => history.push(props.path)}
          >
            <Text style={[AppStyles.h2, AppStyles.textWhite]}>Continue</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  )
}

export default Message

const Styles = StyleSheet.create({
  msgView: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    backgroundColor: 'rgba(200, 200, 200, 0.78)',
  },
  innerView: {
    width: '100%',
    height: '83%',
    top: '17%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 50,
    justifyContent: 'center',
    paddingBottom: 150,
  },
  msgText: {
    fontSize: 18,
    textAlign: 'center',
  },
})
