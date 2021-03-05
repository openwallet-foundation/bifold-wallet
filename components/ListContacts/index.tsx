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
import CurrentContact from '../CurrentContact/index'

import {ErrorsContext} from '../Errors/index'

import AppStyles from '../../assets/styles'
import Images from '../../assets/images'
import Styles from './styles'
import { IContact } from '../../types'

interface IListContacts {
  contacts: IContact[] 

}


function ListContacts(props: IListContacts) {
  let history = useHistory()

  const [viewContact, setViewContact] = useState(true)
  const [contactInfo, setContactInfo] = useState('')

  return (
    <>
      <BackButton backPath={'/home'} />
      {viewContact ? (
        <View style={AppStyles.viewFull}>
          <View style={AppStyles.header}>
            <AppHeader headerText={'CONTACTS'} />
          </View>
          <View style={[Styles.credView, AppStyles.backgroundSecondary]}>
            <TouchableOpacity
              style={Styles.backbutton}
              hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
              onPress={() => history.push('/home')}>
              <Image source={Images.arrowDown} style={AppStyles.arrow} />
            </TouchableOpacity>
            {props.contacts.map((contact, i) => (
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
                    {contact.label}
                  </Text>
                  <Text style={[{fontSize: 14}, AppStyles.textWhite]}>
                    {contact.sublabel}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    console.log(contact.label)
                    setContactInfo(contact)
                    setViewContact(false)
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
      ) : (
        <CurrentContact contact={contactInfo} setViewContact={setViewContact} />
      )}
    </>
  )
}

export default ListContacts
