import React from 'react'

import {StyleSheet} from 'react-native'

const styles = StyleSheet.create({
  title: {
    top: -28,
  },
  message: {
    backgroundColor: '#eee',
    width: '80%',
    maxHeight: '50%',
    top: -20,
  },
  messageFill: {
    padding: 20,
  },
  checkbox: {
    width: 35,
    height: 35,
    backgroundColor: '#ddd',
    borderColor: '#0A1C40',
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
  },
  checkmark: {
    fontSize: 54,
    bottom: 26,
  },
  checktext: {
    justifyContent: 'center',
    fontSize: 18,
    textAlign: 'center',
  },
  checkContainer: {
    backgroundColor: '#eee',
    padding: 12,
    display: 'flex',
    flexDirection: 'row',
    borderRadius: 4,
    width: '100%',
    height: 66,
    alignItems: 'center',
  },
  nextButton: {
    top: 15,
  },
})

export default styles
