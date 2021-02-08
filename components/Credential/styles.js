import React from 'react'

import {StyleSheet} from 'react-native'

const Styles = StyleSheet.create({
  tabView: {
    backgroundColor: '#ddd',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: '7%',
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
    backgroundColor: '#0A1C40'
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

export default Styles
