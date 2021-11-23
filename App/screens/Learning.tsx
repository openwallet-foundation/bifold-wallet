import { useFocusEffect } from '@react-navigation/native'
import React, { Ref, useCallback, useRef, useState } from 'react'
import { Animated, BackHandler, Dimensions, FlatList, StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SvgProps } from 'react-native-svg'

import WelcomeOne from '../assets/img/welcome-1.svg'
import WelcomeTwo from '../assets/img/welcome-2.svg'
import { Pagination } from '../components/shared/Pagination'
import { Colors } from '../globalStyles'
import { setTutorialCompletionStatus } from '../utils/storage'

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  headerSize: {
    width: '123',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 32,
    color: Colors.textColor,
  },
  bodyText: {
    fontWeight: 'normal',
    fontSize: 32,
    textAlign: 'center',
    margin: 16,
    color: Colors.textColor,
  },
  blarb: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  primaryButton: {
    padding: 16, // was 16 32
    borderRadius: 4,
    backgroundColor: Colors.mainColor,
  },
  primaryButtonText: {
    fontSize: 18,
    color: Colors.textColor,
  },
})

const Learning: React.FC<any> = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const flatList: Ref<FlatList> = useRef(null)
  const scrollX = useRef(new Animated.Value(0)).current
  const onViewableItemsChangedRef = useRef(({ viewableItems }: any) => {
    setActiveIndex(viewableItems[0].index)
  })
  const viewabilityConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 50,
  })

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
  })
  const data: { image: React.FC<SvgProps>; text: string }[] = [
    {
      image: WelcomeOne,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
      image: WelcomeTwo,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
  ]
  const next = () => {
    if (activeIndex + 1 < data.length) {
      flatList?.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      })
    }
  }
  const previous = () => {
    if (activeIndex !== 0) {
      flatList?.current?.scrollToIndex({
        index: activeIndex - 1,
        animated: true,
      })
    }
  }

  const renderItem = useCallback(
    ({ item, index }: { item: { image: React.FC<SvgProps>; text: string }; index: number }) => (
      <View key={index} style={[{ width }, { alignItems: 'center' }]}>
        {item.image({
          fill: Colors.textColor,
          height: 180,
          width: 180,
        })}
        <Text style={styles.bodyText}>{item.text}</Text>
      </View>
    ),
    []
  )

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp()
        return true
      }
      BackHandler.addEventListener('hardwareBackPress', onBackPress)
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    }, [])
  )

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.headerText]}>BC Wallet</Text>
      <FlatList
        ref={flatList}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={[{ width }]}
        data={data}
        renderItem={renderItem}
        viewabilityConfig={viewabilityConfigRef.current}
        onViewableItemsChanged={onViewableItemsChangedRef.current}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
      <Pagination data={data} scrollX={scrollX} next={next} previous={previous} />
      <View style={styles.blarb}>
        <TouchableHighlight
          style={[styles.primaryButton]}
          underlayColor={Colors.activeMain}
          onPress={async () => {
            await setTutorialCompletionStatus(true)
            navigation.navigate('Home')
          }}
        >
          <Text style={[styles.primaryButtonText, { fontWeight: 'bold' }]}>Get started</Text>
        </TouchableHighlight>
      </View>
    </SafeAreaView>
  )
}

export default Learning
