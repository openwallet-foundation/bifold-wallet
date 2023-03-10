import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { DispatchAction } from '../../contexts/reducers/store'
import { useStore } from '../../contexts/store'
import { useTheme } from '../../contexts/theme'

interface ProofRequestTutorialModalProps {
  visible: boolean
}

const useStyles = () => {
  const { ColorPallet, TextTheme, borderRadius } = useTheme()

  return StyleSheet.create({
    centeredView: {
      flex: 1,
      paddingLeft: 12,
      paddingRight: 12,
      justifyContent: 'center',
    },
    modalView: {
      position: 'relative',
      backgroundColor: ColorPallet.brand.modalSecondaryBackground,
      borderRadius: borderRadius,
    },
    headerContainer: {
      marginBottom: 16,
    },
    titleContainer: {
      marginBottom: 16,
      marginRight: 16,
    },
    titleText: {
      ...TextTheme.headingThree,
    },
    description: {
      ...TextTheme.normal,
    },
    image: {
      width: '100%',
      height: 200,
      marginBottom: 16,
    },
    closeButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: ColorPallet.brand.modalSecondaryBackground,
    },
    closeButtonIcon: {
      color: ColorPallet.grayscale.white,
    },
  })
}

const closeIconSize = 35
const closeIconName = 'close'

const SlideContainer: React.FC = ({ children }) => {
  const { width: windowWidth } = useWindowDimensions()
  const width = useMemo(() => windowWidth - 12 * 2, [windowWidth])

  return <View style={{ width, flexDirection: 'row' }}>{children}</View>
}

const FirstCarouselView = () => {
  const style = useStyles()
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <View style={style.headerContainer}>
        <View style={style.titleContainer}>
          <Text style={style.titleText}>Show this QR code to the other person</Text>
        </View>
      </View>
      <Image source={{ uri: 'https://reactjs.org/logo-og.png' }} style={style.image} />
      <View>
        <Text style={style.description} numberOfLines={3}>
          You will connect with the other person. They will receive a proof request.
        </Text>
      </View>
    </View>
  )
}

interface SlideListItem {
  name: string
  component: React.ReactNode
}

const ProofRequestTutorialModal: React.FC<ProofRequestTutorialModalProps> = ({ visible }) => {
  const [, dispatch] = useStore()
  const style = useStyles()
  const [modalVisible, setModalVisible] = useState<boolean>(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList<SlideListItem> | null>()
  const slides: SlideListItem[] = useMemo(
    () => [
      {
        name: 'first',
        component: <FirstCarouselView />,
      },
      {
        name: 'second',
        component: <FirstCarouselView />,
      },
    ],
    []
  )

  const close = () => {
    setModalVisible(false)
  }

  const completeTutorial = () => {
    dispatch({ type: DispatchAction.DID_COMPLETE_QR_CODE_TUTORIAL })
  }

  const onViewRef = useRef(({ changed }: { changed: any }) => {
    if (changed[0].isViewable) {
      setCurrentIndex(changed[0].index)
    }
  })

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ animated: true, index })
  }

  const onNext = () => scrollToIndex(currentIndex + 1)
  const onSkip = () => completeTutorial()

  const renderItems: React.FC<{ item: SlideListItem }> = ({ item }) => {
    return <SlideContainer>{item.component}</SlideContainer>
  }

  useEffect(() => {
    if (visible !== undefined) {
      setModalVisible(visible)
    }
  }, [visible])

  return (
    <Modal visible={modalVisible} transparent={true} onRequestClose={() => close()}>
      <View style={style.centeredView}>
        <View style={style.modalView}>
          <View style={style.closeButton}>
            <TouchableOpacity style={style.closeButton} onPress={() => completeTutorial()}>
              <Icon name={closeIconName} size={closeIconSize} style={style.closeButtonIcon} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={slides}
            renderItem={renderItems}
            keyExtractor={(item) => item.name}
            pagingEnabled
            horizontal
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewRef.current}
            ref={(ref) => {
              flatListRef.current = ref
            }}
          />
          <View
            style={{
              paddingHorizontal: 24,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <TouchableOpacity onPress={() => onSkip()} style={{ padding: 16 }}>
              <Text style={{ color: '#fff' }}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onNext()} style={{ padding: 16 }}>
              <Text style={{ color: '#fff' }}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default ProofRequestTutorialModal
