import React, { useState, useContext } from 'react'

import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native'

import { useHistory } from 'react-router-native'

import AppHeader from '../../../../components/AppHeader/index'
import BackButton from '../../../../components/BackButton/index'
import CurrentContact from '../../../../components/CurrentContact/index'
import CurrentCredential from '../../../../components/CurrentCredential/index'

import { ErrorsContext } from '../contexts/Errors'
import { NotificationsContext } from '../contexts/Notifications'

import Images from '../../assets/images'
import AppStyles from '../../assets/styles'
import { IContact, ICredential } from '../../types'

interface ICredentialRequested {
  contact: IContact
  credential: ICredential
}

function CredentialRequested(props: ICredentialRequested) {
  const history = useHistory()

  const errors = useContext(ErrorsContext)
  const notifications = useContext(NotificationsContext)

  const [viewInfo, setViewInfo] = useState('')
  const [viewContact, setViewContact] = useState(false)
  const [viewCredential, setViewCredential] = useState(false)

  return (
    <>
      <BackButton backPath={'/workflow/connect'} />
      <>
        <View style={AppStyles.viewFull}>
          <View style={AppStyles.header}>
            <AppHeader headerText={'CREDENTIALS'} />
          </View>
          <View style={[AppStyles.tab, styles.tabView]}>
            <Text style={[AppStyles.h3, AppStyles.textSecondary, AppStyles.textUpper, AppStyles.textBold]}>
              Connected to:
            </Text>
            <View style={AppStyles.tableItem}>
              <View>
                <Text style={[{ fontSize: 18 }, AppStyles.textSecondary, AppStyles.textUpper, AppStyles.textBold]}>
                  {props.contact.label}
                </Text>
                <Text style={[{ fontSize: 14 }, AppStyles.textSecondary]}>{props.contact.sublabel}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setViewInfo(props.contact)
                  setViewContact(true)
                }}
              >
                <Image source={Images.infoGray} style={[AppStyles.info, { marginRight: 0, top: 10 }]} />
              </TouchableOpacity>
            </View>
            <View style={AppStyles.tableItem}>
              <View>
                <Text style={[{ fontSize: 18 }, AppStyles.textSecondary, AppStyles.textUpper, AppStyles.textBold]}>
                  {props.credential.label}
                </Text>
                <Text style={[{ fontSize: 14 }, AppStyles.textSecondary]}>{props.credential.sublabel}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setViewInfo(props.credential)
                  setViewCredential(true)
                }}
              >
                <Image source={Images.infoGray} style={[AppStyles.info, { marginRight: 0, top: 10 }]} />
              </TouchableOpacity>
            </View>
            <View style={styles.buttonWrap}>
              <Text
                style={[
                  { fontSize: 18 },
                  AppStyles.textSecondary,
                  AppStyles.textUpper,
                  Styles.buttonText,
                  AppStyles.textBold,
                ]}
              >
                Send Credentials
              </Text>
              <TouchableOpacity
                style={[styles.button, AppStyles.backgroundPrimary]}
                onPress={() => {
                  history.push('/home')
                }}
              >
                <Image source={Images.send} style={styles.buttonIcon} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{ top: 60 }}
              onPress={() => {
                history.push('/home')
              }}
            >
              <Text style={[{ fontSize: 14 }, AppStyles.textGray, AppStyles.textCenter]}>Decline{'\n'}Request</Text>
            </TouchableOpacity>
          </View>
        </View>
        {viewCredential ? <CurrentCredential credential={viewInfo} setViewCredential={setViewCredential} /> : null}
        {viewContact ? <CurrentContact contact={viewInfo} setViewContact={setViewContact} /> : null}
      </>
    </>
  )
}

export default CredentialRequested

const styles = StyleSheet.create({
  tabView: {
    backgroundColor: '#ddd',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: '7%',
  },
  icon: {
    fontSize: 26,
    top: 10,
  },
  button: {
    marginVertical: 7,
    width: 125,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    maxWidth: 120,
    flexWrap: 'wrap',
    textAlign: 'right',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  buttonWrap: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: -10,
    top: 40,
  },
  buttonIcon: {
    width: 30,
    height: 43,
  },
})
