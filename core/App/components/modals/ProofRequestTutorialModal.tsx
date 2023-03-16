import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Dimensions, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import ScanShare from '../../assets/img/scan-share.svg'
import { DispatchAction } from '../../contexts/reducers/store'
import { useStore } from '../../contexts/store'
import { useTheme } from '../../contexts/theme'
import { Pagination } from '../misc/Pagination'

interface ProofRequestTutorialModalProps {
  visible: boolean
}

const closeIconSize = 35
const closeIconName = 'close'

const { width: windowWidth } = Dimensions.get('window')
const width = windowWidth - 12 * 2

const useStyles = () => {
  const { ColorPallet, TextTheme, borderRadius } = useTheme()

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingLeft: 12,
      paddingRight: 12,
      justifyContent: 'center',
    },
    modalView: {
      position: 'relative',
      backgroundColor: ColorPallet.brand.secondaryBackground,
      borderRadius,
    },
    itemContainer: {
      width,
      flexDirection: 'row',
    },
    carouselViewContainer: { flex: 1, padding: 24 },
    titleContainer: {
      marginBottom: 16,
      marginRight: 30,
    },
    titleText: {
      ...TextTheme.headingThree,
      color: ColorPallet.grayscale.white,
    },
    descriptionContainer: {
      marginVertical: 8,
    },
    description: {
      ...TextTheme.normal,
      color: ColorPallet.grayscale.white,
    },
    imageContainer: {
      width: '100%',
      height: 200,
      marginBottom: 16,
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 1,
    },
    closeButtonIcon: {
      color: ColorPallet.grayscale.white,
    },
    carouselPaginationContainer: {
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    carouselButtonText: {
      color: ColorPallet.grayscale.white,
    },
    carouselButton: {
      padding: 16,
      flexBasis: '30%',
      alignItems: 'center',
    },
    carouselButtonTextDisabled: {
      color: 'transparent',
    },
  })
}

const usePaginationStyles = () => {
  const { ColorPallet } = useTheme()

  return {
    pagerContainer: {
      flexShrink: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    pagerDot: {
      borderColor: ColorPallet.brand.primary,
      borderWidth: 1,
      borderStyle: 'solid',
    },
    pagerDotActive: {
      color: ColorPallet.brand.primary,
    },
    pagerDotInactive: {
      color: ColorPallet.brand.secondary,
    },
    pagerPosition: {
      position: 'relative',
      top: 0,
    },
    pagerNavigationButton: {
      color: ColorPallet.grayscale.white,
      fontSize: 18,
      fontWeight: 'bold',
    },
  }
}

// It is temporary view, the content for slides will be clarified later.
const CarouselViewPlaceholder = () => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()
  const style = useStyles()

  return (
    <View style={style.carouselViewContainer}>
      <View style={style.titleContainer}>
        <Text style={style.titleText}>{t('Verifier.TutorialStep1Title')}</Text>
      </View>
      <View style={style.imageContainer}>
        <ScanShare stroke={ColorPallet.grayscale.white} />
      </View>
      <View style={style.descriptionContainer}>
        <Text style={style.description}>{t('Verifier.TutorialStep1Description')}</Text>
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
  const paginationStyle = usePaginationStyles()
  const scrollX = useRef(new Animated.Value(0)).current
  const [modalVisible, setModalVisible] = useState<boolean>(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList<SlideListItem> | null>()
  const slides: SlideListItem[] = useMemo(
    () => [
      {
        name: 'firstStep',
        component: <CarouselViewPlaceholder />,
      },
      {
        name: 'secondStep',
        component: <CarouselViewPlaceholder />,
      },
      {
        name: 'thirdStep',
        component: <CarouselViewPlaceholder />,
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

  const viewabilityConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 80,
  })

  const onViewRef = useRef(({ changed }: { changed: any }) => {
    if (changed[0].isViewable) {
      setCurrentIndex(changed[0].index)
    }
  })

  const scrollToIndex = useCallback(
    (index: number) => {
      flatListRef.current?.scrollToIndex({ animated: true, index })
    },
    [flatListRef]
  )

  const activateNextStep = useCallback(() => scrollToIndex(currentIndex + 1), [currentIndex])

  const isLastStepActive = useMemo(() => currentIndex === slides.length - 1, [currentIndex, slides])

  const renderItems: React.FC<{ item: SlideListItem }> = ({ item }) => {
    return <View style={style.itemContainer}>{item.component}</View>
  }

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
  })

  useEffect(() => {
    if (visible !== undefined) {
      setModalVisible(visible)
    }
  }, [visible])

  return (
    <Modal visible={modalVisible} transparent={true} onRequestClose={() => close()}>
      <View style={style.container}>
        <View style={style.modalView}>
          <TouchableOpacity style={style.closeButton} onPress={() => close()}>
            <Icon name={closeIconName} size={closeIconSize} style={style.closeButtonIcon} />
          </TouchableOpacity>
          <FlatList
            data={slides}
            renderItem={renderItems}
            keyExtractor={(item) => item.name}
            pagingEnabled
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            viewabilityConfig={viewabilityConfigRef.current}
            onViewableItemsChanged={onViewRef.current}
            ref={(ref) => {
              flatListRef.current = ref
            }}
          />
          <View style={style.carouselPaginationContainer}>
            <TouchableOpacity onPress={() => completeTutorial()} style={style.carouselButton}>
              <Text style={style.carouselButtonText}>Skip</Text>
            </TouchableOpacity>
            <Pagination
              pages={slides}
              activeIndex={currentIndex}
              scrollX={scrollX}
              next={() => activateNextStep()}
              previous={() => completeTutorial()}
              style={paginationStyle}
            />
            {isLastStepActive ? (
              <TouchableOpacity onPress={() => completeTutorial()} style={style.carouselButton}>
                <Text style={style.carouselButtonText}>Complete</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => activateNextStep()} style={style.carouselButton}>
                <Text style={style.carouselButtonText}>Next</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default ProofRequestTutorialModal
