import React from 'react'

import { Dimensions, StyleSheet } from 'react-native'

// setting camera dimensions based on width of screen
let CameraWidth = 0.82 * Dimensions.get('window').width

const styles = StyleSheet.create({
  header: {
    height: '28%',
    justifyContent: 'center',
  },
  camera: {
    width: CameraWidth,
    height: CameraWidth,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: '#0A1C40',
    borderRadius: 3,
    alignItems: 'center',
    overflow: 'hidden',
    justifyContent: 'center',
  },
})

export default styles
