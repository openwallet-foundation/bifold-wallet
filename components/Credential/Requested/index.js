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

import AppHeader from '../../AppHeader/index.js'
import BackButton from '../../BackButton/index.js'
import CurrentContact from '../../CurrentContact/index.js'
import CurrentCredential from '../../CurrentCredential/index.js'
import LoadingOverlay from '../../LoadingOverlay/index.js'

import {ErrorsContext} from '../../Errors/index.js'
import {NotificationsContext} from '../../Notifications/index.js'

import Styles from '../styles'
import Images from '../../../assets/images'
import AppStyles from '../../../assets/styles'

function CredentialRequested(props) {
  let history = useHistory()

  const errors = useContext(ErrorsContext)
  const notifications = useContext(NotificationsContext)

  const [viewContact, setViewContact] = useState(true)
  const [viewCredential, setViewCredential] = useState(true)

  return (
    <>
    <BackButton backPath={'/workflow/connect'} />
    {!viewContact ? (
      <CurrentContact 
      contact={props.contact}
      setViewContact={setViewContact}
    />
    ) : (
    <>
    {!viewCredential ? (
      <CurrentCredential 
        credential={props.credential}
        setViewCredential={setViewCredential}
      />
    ) : (
    <View style={AppStyles.viewFull}>
      <View style={AppStyles.header}>
        <AppHeader headerText={'CREDENTIALS'} />
      </View>
      <View style={[AppStyles.tab, Styles.tabView]}>
        <Text
          style={[AppStyles.h3, AppStyles.textBlueDark, AppStyles.textUpper, AppStyles.textBold]}>
          Connected to:
        </Text>
        <View style={AppStyles.tableItem}>
          <View>
            <Text
              style={[
                {fontSize: 18},
                AppStyles.textBlueDark,
                AppStyles.textUpper,
                AppStyles.textBold
              ]}>
              {props.contact.label}
            </Text>
            <Text style={[{fontSize: 14}, AppStyles.textBlueDark]}>
              {props.contact.sublabel}
            </Text>
          </View>
          <TouchableOpacity
              onPress={() => {
                setViewContact(!viewContact)
              }}>
            <Image
              source={Images.infoBlue}
              style={[AppStyles.info, {marginRight: 0, top: 10}]}
            />
          </TouchableOpacity>
        </View>
        <View style={AppStyles.tableItem}>
          <View>
            <Text
              style={[
                {fontSize: 18},
                AppStyles.textBlueDark,
                AppStyles.textUpper,
                AppStyles.textBold
              ]}>
              {props.credential.label}
            </Text>
            <Text style={[{fontSize: 14}, AppStyles.textBlueDark]}>
              {props.credential.sublabel}
            </Text>
          </View>
          <TouchableOpacity
              onPress={() => {
                setViewCredential(!viewCredential)
              }}>
            <Image
              source={Images.infoBlue}
              style={[AppStyles.info, {marginRight: 0, top: 10}]}
            />
          </TouchableOpacity>
        </View>
        <View style={Styles.buttonWrap}>
          <Text
            style={[
              {fontSize: 18},
              AppStyles.textBlueDark,
              AppStyles.textUpper,
              Styles.buttonText,
              AppStyles.textBold
            ]}>
            Send Credentials
          </Text>
          <TouchableOpacity style={Styles.button}>
          <Image source={Images.send} style={Styles.buttonIcon} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{top: 60}}
          onPress={() => history.push('/home')}>
          <Text style={[{fontSize: 14}, AppStyles.textGrayDark, AppStyles.textCenter]}>
            Decline{'\n'}Request
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    )}
    </>
    )}
    </>
  )
}

export default CredentialRequested
