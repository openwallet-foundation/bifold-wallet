import React, {useState, useEffect, useContext} from 'react'

import {Alert, BackHandler} from 'react-native'

import {useHistory, useLocation} from 'react-router-native'

function BackButton(props) {
  let history = useHistory()
  let location = useLocation()

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick)
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      )
    }
  }, [location])

  const handleBackButtonClick = () => {
    if(props.backExit) {
        Alert.alert(
            'Exit the App',
            'Are you sure you want to exit?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {text: "I'm Sure", onPress: () => BackHandler.exitApp()},
            ],
            {cancelable: false},
          )
    } else if(props.backPath) {
        console.log('The path is: ', props.backPath)
      history.push(props.backPath)
    } else {
      return true
    }
    return true
  } 

  return <></>
}

export default BackButton
