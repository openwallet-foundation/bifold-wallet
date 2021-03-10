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

import AppHeader from '../../../AppHeader/index'
import BackButton from '../../../BackButton/index'
import CurrentContact from '../../../CurrentContact/index'
import CurrentCredential from '../../../CurrentCredential/index'
import LoadingOverlay from '../../../LoadingOverlay/index'

import AgentContext from '../../../AgentProvider/'

import Images from '../../../../assets/images'
import Styles from '../styles'
import AppStyles from '../../../../assets/styles'
import { IContact, ICredential } from '../../../../types'

interface ICredentialOffered {
  contact: IContact
  credential: ICredential
}

function CredentialOffered(props: ICredentialOffered) {
  let history = useHistory()

  //Reference to the agent context
  const agentContext = useContext(AgentContext)


  useEffect(() => {
    console.log(props.credential)
  }, [])

  const [viewInfo, setViewInfo] = useState('')
  const [viewContact, setViewContact] = useState(false)
  const [viewCredential, setViewCredential] = useState(false)

  const acceptOffer = async () => {
    console.log("Attempting to accept offer")
    await agentContext.agent.credentials.acceptOffer(props.credential.id)

    //TODO:
    //Push to pending issuance screen
    history.push('/home')
  }

  return (
    <>
      <BackButton backPath={'/workflow/connect'} />
        <>
            <View style={AppStyles.viewFull}>
              <View style={AppStyles.header}>
                <AppHeader headerText={'CREDENTIALS'} />
              </View>
              <View style={[AppStyles.tab, Styles.tabView]}>
                <Text
                  style={[
                    AppStyles.h3,
                    AppStyles.textSecondary,
                    AppStyles.textUpper,
                    AppStyles.textBold,
                  ]}>
                  Credential from:
                </Text>
                <View style={AppStyles.tableItem}>
                  <View>
                    <Text
                    style={[
                      {fontSize: 20, top: 8},
                      AppStyles.textBlack,
                      AppStyles.textBold,
                      ]}>
                      {props.contact.alias ? props.contact.alias : props.contact.invitation.label}
                    </Text>
                    <Text style={[{fontSize: 14}, AppStyles.textSecondary]}>
                      {props.contact.sublabel}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setViewInfo(props.contact)
                      setViewContact(true)
                    }}>
                    <Image
                      source={Images.infoGray}
                      style={[AppStyles.info, {marginRight: 0, top: 10}]}
                    />
                  </TouchableOpacity>
                </View>
                <View style={AppStyles.tableItem}>
                  <View>
                    <Text
                      style={[
                        {fontSize: 20, top: 8},
                        AppStyles.textSecondary,
                        AppStyles.textBold,
                      ]}>
                      {/*Temporary hardcoding*/}
                      Driver's License
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setViewInfo(props.credential)
                      setViewCredential(true)
                    }}>
                    <Image
                      source={Images.infoGray}
                      style={[AppStyles.info, {marginRight: 0, top: 10}]}
                    />
                  </TouchableOpacity>
                </View>
                <View style={Styles.buttonWrap}>
                  <Text
                    style={[
                      {fontSize: 18},
                      AppStyles.textSecondary,
                      AppStyles.textUpper,
                      Styles.buttonText,
                      AppStyles.textBold,
                    ]}>
                    Claim Credentials
                  </Text>
                  <TouchableOpacity
                    style={[Styles.button, AppStyles.backgroundPrimary]}
                    onPress={() => {
                      acceptOffer()
                    }}>
                    <Image source={Images.receive} style={Styles.buttonIcon} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={{top: 60}}
                  onPress={() => {
                    history.push('/home')
                  }}>
                  <Text
                    style={[
                      {fontSize: 14},
                      AppStyles.textGray,
                      AppStyles.textCenter,
                    ]}>
                    Decline{'\n'}Offer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {viewCredential ? (
              <CurrentCredential
                credential={viewInfo}
                setViewCredential={setViewCredential}
              />
            ) : null}
            {viewContact ? (
              <CurrentContact contact={viewInfo} setViewContact={setViewContact} />
            ) : null}
        </>
    </>
  )
}

export default CredentialOffered
