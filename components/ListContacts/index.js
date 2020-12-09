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
import CurrentContact from '../CurrentContact/index.js'

import {ErrorsContext} from '../Errors/index.js'

import AppStyles from '../../assets/styles'
import Images from '../../assets/images.js'
import Styles from './styles'

function ListContacts(props) {
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
        <View style={Styles.credView}>
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
                  {backgroundColor: '#0A1C40'},
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
                  }}
                >
                  <Text style={[{marginRight: 18, fontSize: 24}, AppStyles.textWhite]}>?</Text>
                </TouchableOpacity>
              </View>
          ))}
        </View>
    </View>
      ) : 
        <CurrentContact 
          contact={contactInfo}
          setViewContact={setViewContact}
        />
      }
    </>
  )
}

export default ListContacts