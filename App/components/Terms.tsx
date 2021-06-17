import React, { useState, useContext } from 'react'

import { Image, ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native'

import { useHistory } from 'react-router-native'

import AppHeaderLarge from './AppHeaderLarge'
import LoadingOverlay from './LoadingOverlay'

import { ErrorsContext } from '../contexts/Errors/index'

import AppStyles from '../../assets/styles'
import Images from '../../assets/images'

interface ITerms {
  title: string
  message: string
}

function Terms(props: ITerms) {
  const history = useHistory()

  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(false)

  const [isChecked, setIsChecked] = useState(false)

  const errors = useContext(ErrorsContext)

  return (
    <View style={AppStyles.viewFull}>
      <AppHeaderLarge disabled={true} />
      <View style={AppStyles.tab}>
        <Text style={[AppStyles.h2, AppStyles.textSecondary, styles.title]}>{props.title}</Text>
        <ScrollView style={[styles.message, AppStyles.backgroundWhite]}>
          <View style={styles.messageFill}>
            <Text>{props.message}</Text>
          </View>
        </ScrollView>
        <TouchableOpacity
          style={{ width: '80%' }}
          hitSlop={{ top: 20, bottom: 0, left: 10, right: 10 }}
          onPress={() => {
            setIsChecked((previousState) => !previousState)
          }}
        >
          <View style={[styles.checkContainer, AppStyles.backgroundWhite]}>
            <View style={[styles.checkbox, AppStyles.backgroundWhite]}>
              {isChecked ? <Image source={Images.checkmark} style={styles.checkmark} /> : null}
            </View>
            <Text style={[styles.checktext, AppStyles.textBlack]}>
              I have read and agree to{'\n'}
              {props.title}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            AppStyles.button,
            styles.nextButton,
            isChecked ? AppStyles.backgroundPrimary : AppStyles.backgroundGray,
          ]}
          disabled={isChecked ? false : true}
          onPress={() => {
            setLoadingOverlayVisible(true)
            setTimeout(() => {
              console.log('Terms Change')
              setLoadingOverlayVisible(false)
              setIsChecked((previousState) => !previousState)
              props.setSetupScreens(props.setupScreens + 1)
            }, 2000)
          }}
        >
          <Text style={[AppStyles.h2, AppStyles.textWhite]}>Submit</Text>
        </TouchableOpacity>
      </View>
      {loadingOverlayVisible ? <LoadingOverlay /> : null}
    </View>
  )
}

export default Terms

const styles = StyleSheet.create({
  title: {
    top: -28,
  },
  message: {
    borderRadius: 10,
    width: '80%',
    maxHeight: '50%',
    top: -20,
  },
  messageFill: {
    padding: 20,
  },
  checkbox: {
    width: 35,
    height: 35,
    backgroundColor: '#ddd',
    borderColor: '#0A1C40',
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
  },
  checkmark: {
    width: '140%',
    height: '140%',
    bottom: '20%',
  },
  checktext: {
    justifyContent: 'center',
    fontSize: 18,
    textAlign: 'center',
  },
  checkContainer: {
    borderRadius: 10,
    padding: 12,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: 66,
    alignItems: 'center',
  },
  nextButton: {
    top: 15,
  },
})
