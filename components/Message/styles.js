import React from 'react'

import {StyleSheet} from 'react-native'

const Styles = StyleSheet.create({
  msgView: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    backgroundColor: 'rgba(200, 200, 200, 0.78)',
  },
  innerView: {
    width: '100%',
    height: '83%',
    top: '17%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 50,
    justifyContent: 'center',
    paddingBottom: 150,
  },
  msgText: {
    fontSize: 18,
    textAlign: 'center',
  },
})

export default Styles
