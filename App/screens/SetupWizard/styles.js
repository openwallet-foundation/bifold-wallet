import React from 'react'

import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  dot: {
    borderRadius: 18,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#343f40',
    width: 18,
    height: 18,
    marginHorizontal: 8,
  },
  dotContainer: {
    alignItems: 'center',
    height: '8%',
    width: '100%',
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#eee',
    elevation: 2,
  },
  image: {
    alignSelf: 'center',
    width: 60,
    height: 68,
  },
})

export default styles
