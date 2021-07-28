import React from 'react'

import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native'

import Images from '../../../assets/images'
import AppStyles from '../../../assets/styles'

interface AppHeaderProps {
  headerText?: string
}

function AppHeader(props: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => {}}>
        <View style={styles.headerView}>
          {props.headerText ? (
            <>
              <Image source={Images.logo} style={{ marginRight: 10 }} />
              <Text style={[AppStyles.h1, AppStyles.textSecondary, styles.textBorder, AppStyles.textUpper]}>
                {props.headerText}
              </Text>
            </>
          ) : (
            <Image source={Images.logoText} style={{}} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default AppHeader

const styles = StyleSheet.create({
  header: {
    height: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  textBorder: {
    borderBottomWidth: 3,
    borderColor: '#1b2624',
  },
})
