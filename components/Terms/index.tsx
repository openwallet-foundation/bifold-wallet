import React, {useState, useEffect, useContext} from 'react'

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import {useHistory} from 'react-router-native'

import AppHeaderLarge from '../AppHeaderLarge/index'
import LoadingOverlay from '../LoadingOverlay/index'

import {ErrorsContext} from '../Errors/index'

import AppStyles from '../../assets/styles'
import Styles from './styles'

interface ITerms {
  title: string
  message: string
}

function Terms(props: ITerms) {
  let history = useHistory()

  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(false)

  const [isChecked, setIsChecked] = useState(false)

  const errors = useContext(ErrorsContext)

  return (
    <View style={AppStyles.viewFull}>
      <AppHeaderLarge disabled={true} />
      <View style={AppStyles.tab}>
        <Text style={[AppStyles.h2, AppStyles.textSecondary, Styles.title]}>
          {props.title}
        </Text>
        <ScrollView style={[Styles.message, AppStyles.backgroundWhite]}>
          <View style={Styles.messageFill}>
            <Text>{props.message}</Text>
          </View>
        </ScrollView>
        <TouchableOpacity
          style={{width: '80%'}}
          hitSlop={{top: 20, bottom: 0, left: 10, right: 10}}
          onPress={() => {
            setIsChecked((previousState) => !previousState)
          }}>
          <View style={[Styles.checkContainer, AppStyles.backgroundWhite]}>
            <View style={[Styles.checkbox, AppStyles.backgroundWhite]}>
              {isChecked ? (
                <Text style={[AppStyles.textBlack, Styles.checkmark]}>
                  &#10003;
                </Text>
              ) : null}
            </View>
            <Text style={[Styles.checktext, AppStyles.textBlack]}>
              I have read and agree to{'\n'}
              {props.title}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            AppStyles.button,
            Styles.nextButton,
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
          }}>
          <Text style={[AppStyles.h2, AppStyles.textWhite]}>Submit</Text>
        </TouchableOpacity>
      </View>
      {loadingOverlayVisible ? <LoadingOverlay /> : null}
    </View>
  )
}

export default Terms
