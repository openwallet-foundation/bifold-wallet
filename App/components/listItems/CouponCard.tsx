import { Text } from 'components'
import React from 'react'
import { StyleSheet, View } from 'react-native'

const styles = StyleSheet.create({
  name: {
    fontSize: 27,
    marginTop: 18,
    color: 'white',
  },
  coupon: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    marginTop: 20,
    backgroundColor: '#57dec7',
    borderRadius: 40,
  },
  card: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '90%',
    overflow: 'visible',
    padding: 20,
  },
  filled: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f28b3d',
    margin: 8,
    borderWidth: 2,
    borderColor: '#916b44',
  },
  empty: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9da69f',
    margin: 8,
    borderWidth: 2,
    borderColor: '#b4bfba',
  },
  percent: {
    color: '#dddddd',
    fontWeight: "900",
    fontSize: 24,
  },
})

const StampFilled = () => {
  return (
    <View style={styles.filled}>
      <Text style={styles.percent}>&#x25;</Text>
    </View>
  )
}

const StampEmpty = () => {
  return (
    <View style={styles.empty}>
      <Text style={styles.percent}>&#x25;</Text>
    </View>
  )
}

const CouponCard = ({ num, name }) => {
  const stamps = []

  for (let i = 0; i < num; i++) {
    stamps.push(<StampFilled key={i} />)
  }

  for (let i = num; i < 10; i++) {
    stamps.push(<StampEmpty key={i} />)
  }

  return (
    <View style={styles.coupon}>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.card}>{stamps}</View>
    </View>
  )
}

export default CouponCard
