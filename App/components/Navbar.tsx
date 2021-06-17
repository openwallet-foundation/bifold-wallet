import React from 'react'

import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native'

import { Link } from 'react-router-native'

import Images from '../../assets/images'
import AppStyles from '../../assets/styles'

interface INavbar {
  authenticated: boolean
}

function Navbar(props: INavbar) {
  return (
    <>
      {props.authenticated ? (
        <View style={[styles.navView, AppStyles.backgroundWhite]}>
          <Link style={styles.navButton} component={TouchableOpacity} to="/home">
            <Image source={Images.navHome} style={{ width: 32, height: 28 }} />
            <Text style={styles.textSmall}>Home</Text>
          </Link>
          <Link style={styles.navButton} component={TouchableOpacity} to="/contacts">
            <Image source={Images.navContacts} style={{ width: 22, height: 28 }} />
            <Text style={styles.textSmall}>Contacts</Text>
          </Link>
          <Link style={styles.navButton} component={TouchableOpacity} to="/workflow/connect">
            <Image source={Images.navConnect} style={{ width: 38, height: 43, top: -7 }} />
          </Link>
          <Link style={styles.navButton} component={TouchableOpacity} to="/credentials">
            <Image source={Images.navCredentials} style={{ width: 32, height: 28 }} />
            <Text style={styles.textSmall}>Credentials</Text>
          </Link>
          <Link style={styles.navButton} component={TouchableOpacity} to="/settings">
            <Image source={Images.navSettings} style={{ width: 28, height: 28 }} />
            <Text style={styles.textSmall}>Settings</Text>
          </Link>
        </View>
      ) : null}
    </>
  )
}

export default Navbar

const styles = StyleSheet.create({
  navView: {
    width: '101%',
    top: -8,
    marginLeft: '-0.5%',
    height: '100%',
    padding: 20,
    paddingTop: 14,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    bottom: 0,
    borderTopWidth: 2,
    borderRightWidth: 0.1,
    borderLeftWidth: 0.1,
    borderColor: 'rgba(0,0,0,0.2)',
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  navButton: {
    alignItems: 'center',
    width: '20%',
  },
  textSmall: {
    fontSize: 10,
  },
})
