import React from 'react'

import {Dimensions, StyleSheet} from 'react-native'

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

export default styles
