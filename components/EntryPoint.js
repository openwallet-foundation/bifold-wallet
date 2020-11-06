import React, {useState, useEffect, useContext} from 'react'
import {useHistory} from 'react-router-native'
import * as Keychain from 'react-native-keychain'

import LoadingOverlay from './LoadingOverlay.js'

import {ErrorsContext} from './Errors.js'

function EntryPoint(props) {
  let history = useHistory()
  const errors = useContext(ErrorsContext)

  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(false)


  useEffect(() => {
    async function entry(){
      try {
        let passcodeCreated = await Keychain.getGenericPassword({service: 'passcode'})

        if(passcodeCreated) { 
          history.push('/pin/entry')
        } else {
          //throw new Error("Error");
          //history.push('/start')
        }
      } catch (e) {

        errors.setVisible(true);
        errors.setText("Error!");

        console.error('Error During Startup:', e)
      }
    }

    entry()
  }, [])

  return (
    <LoadingOverlay visible={loadingOverlayVisible}/>
  )
}

export default EntryPoint
