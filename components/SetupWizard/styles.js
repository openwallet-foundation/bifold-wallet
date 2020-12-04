import React from 'react'

import {StyleSheet} from 'react-native'

const styles = StyleSheet.create({
  dot: {
    borderRadius: 18,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#388e48',
    width: 18,
    height: 18,
    marginHorizontal: 8,
  },
  dotFilled: {
    backgroundColor: '#388e48',
  },
  dotContainer: {
    alignItems: 'center',
    height: '8%',
    width: '100%',
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    //elevation: -99,
  },
  image: {
    alignSelf: 'center',
    width: 60,
    height: 68,
  },
})

export default styles
