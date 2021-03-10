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

import AppHeader from '../AppHeader/index'
import BackButton from '../BackButton/index'
import CurrentCredential from '../CurrentCredential/index'

import {ErrorsContext} from '../Errors/index'

import AppStyles from '../../assets/styles'
import Images from '../../assets/images'
import Styles from './styles'
import { ICredential } from '../../types'

interface IListCredentials {
  credentials: [ICredential]
}

function ListCredentials(props: IListCredentials) {
  let history = useHistory()

  const [viewInfo, setViewInfo] = useState('')
  const [viewCredential, setViewCredential] = useState(false)

  return (
    <>
      <BackButton backPath={'/home'} />
        <View style={AppStyles.viewFull}>
          <View style={AppStyles.header}>
            <AppHeader headerText={'CREDENTIALS'} />
          </View>
          <View style={[Styles.credView, AppStyles.backgroundSecondary]}>
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
                  AppStyles.backgroundSecondary,
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
                    setViewInfo(credential)
                    setViewCredential(true)
                  }}>
                  <Image
                    source={Images.infoWhite}
                    style={[AppStyles.info, {marginRight: 10, top: 10}]}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        {viewCredential ? (
              <CurrentCredential
                credential={viewInfo}
                setViewCredential={setViewCredential}
              />
            ) : null}
    </>
  )
}

export default ListCredentials
