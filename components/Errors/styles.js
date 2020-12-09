import React from 'react'

import {StyleSheet} from 'react-native'

const Styles = StyleSheet.create({
  errorView: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(200, 200, 200, 0.78)',
  },
  errorMessage: {
    bottom: 40,
    width: '84%',
    height: '44%',
  },
})

export default Styles
