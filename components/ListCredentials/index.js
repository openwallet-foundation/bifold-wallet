import React, {useState, useEffect, useContext} from 'react'

import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import {useHistory} from 'react-router-native'

import AppHeader from '../AppHeader/index.js'
import BackButton from '../BackButton/index.js'
import CurrentCredential from '../CurrentCredential/index.js'

import {ErrorsContext} from '../Errors/index.js'

import AppStyles from '../../assets/styles'
import Images from '../../assets/images.js'
import Styles from './styles'

function ListCredentials(props) {
  let history = useHistory()

  const [viewCredential, setViewCredential] = useState(true)
  const [credentialInfo, setCredentialInfo] = useState('')

  return (
    <>
    <BackButton backPath={'/home'} />
    {viewCredential ? (
    <View style={AppStyles.viewFull}>
      <View style={AppStyles.header}>
        <AppHeader headerText={'CREDENTIALS'} />
      </View>
      <View style={Styles.credView}>
        <TouchableOpacity
          style={Styles.backbutton}
          hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
          onPress={() => history.push('/home')}>
          <Image source={Images.arrowDown} style={AppStyles.arrow} />
        </TouchableOpacity>
        {props.credentials.map((credential, i) => (
            <View
              key={i}
              style={[
                AppStyles.tableItem,
                Styles.tableItem,
                {backgroundColor: '#0A1C40'},
              ]}>
              <View>
                <Text
                  style={[
                    {fontSize: 18},
                    AppStyles.textWhite,
                    AppStyles.textUpper,
                  ]}>
                  {credential.label}
                </Text>
                <Text style={[{fontSize: 14}, AppStyles.textWhite]}>
                  {credential.sublabel}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  console.log(credential.label)
                  setCredentialInfo(credential)
                  setViewCredential(false)
                }}
              >
                <Text style={[{marginRight: 18, fontSize: 24}, AppStyles.textWhite]}>?</Text>
              </TouchableOpacity>
            </View>
        ))}
      </View>
    </View>
    ) : 
    <CurrentCredential 
      credential={credentialInfo}
      setViewCredential={setViewCredential}
    />
  }
    </>
  )
}

export default ListCredentials
