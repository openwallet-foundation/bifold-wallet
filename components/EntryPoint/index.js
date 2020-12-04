import React, {useState, useEffect, useContext} from 'react'
import {useHistory} from 'react-router-native'
import * as Keychain from 'react-native-keychain'

import LoadingOverlay from '../LoadingOverlay/index.js'

import {ErrorsContext} from '../Errors/index.js'

function EntryPoint(props) {
  let history = useHistory()
  const errors = useContext(ErrorsContext)

  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(false)

  useEffect(() => {
    if (props.authenticated) {
      history.push('/home')
    } else {
      async function entry() {
        try {
          let passcodeCreated = await Keychain.getGenericPassword({
            service: 'setupWizard',
          })

          if (passcodeCreated.password == 'true') {
            history.push('/pin/enter')
          } else {
            history.push('/setup-wizard')
          }
        } catch (e) {
          errors.setVisible(true)
          errors.setText('Error!')
          errors.setPath('/')

          console.error('Error During Startup:', e)
        }
      }

      entry()
    }
  }, [])

  return <LoadingOverlay visible={loadingOverlayVisible} />
}

export default EntryPoint
