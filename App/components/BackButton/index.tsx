import React, { useEffect } from 'react'

import { Alert, BackHandler } from 'react-native'

import { useHistory, useLocation } from 'react-router-native'

interface IBackButton {
  backPath?: string
  backExit?: boolean
}

function BackButton(props: IBackButton) {
  const history = useHistory()
  const location = useLocation()

  const handleBackButtonClick = () => {
    if (props.backExit) {
      Alert.alert(
        'Exit the App',
        'Are you sure you want to exit?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          { text: "I'm Sure", onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: false }
      )
    } else if (props.backPath) {
      console.log('The path is: ', props.backPath)
      history.push(props.backPath)
    } else {
      return true
    }
    return true
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick)
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick)
    }
  }, [location])

  return <></>
}

export default BackButton
