import React from 'react'

import { Dimensions, StyleSheet } from 'react-native'

let ScreenHeight = Dimensions.get('window').height

const Styles = StyleSheet.create({
  loadingRectangle: {
    marginHorizontal: 7,
    height: 40,
    width: 10,
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'row',
    height: '20%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '15%',
  },
  loadingOverlay: {
    height: ScreenHeight,
    width: '100%',
    paddingTop: '48%',
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    elevation: 99,
  },
})

export default Styles
