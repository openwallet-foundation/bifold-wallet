import React from 'react'
import { useWindowDimensions } from 'react-native'
import Svg, { Circle, Defs, Ellipse, Mask, Path, Rect } from 'react-native-svg'

export enum MaskType {
  QR_CODE = 'qr-code',
  OVAL = 'oval',
  RECTANGLE = 'rectangle',
  ID_CARD = 'id-card',
  CUSTOM = 'custom',
}

interface ISVGOverlay {
  maskType?: MaskType
  customPath?: string
  strokeColor?: string
  overlayColor?: string
  overlayOpacity?: number
}

const SVGOverlay: React.FC<ISVGOverlay> = ({
  maskType = MaskType.OVAL,
  customPath,
  strokeColor = undefined,
  overlayColor = 'black',
  overlayOpacity = 0.6,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const renderCutOutShape = () => {
    const centerX = screenWidth / 2
    const centerY = screenHeight / 2

    switch (maskType) {
      case MaskType.OVAL:
        return (
          <Ellipse
            cx={centerX}
            cy={centerY - 10}
            rx={screenWidth * 0.45}
            ry={screenHeight * 0.28}
            fill="transparent"
            stroke={strokeColor}
          />
        )

      case MaskType.RECTANGLE: {
        const rectSize = screenWidth * 0.8
        return (
          <Rect
            x={centerX - rectSize / 2}
            y={centerY - rectSize / 2}
            width={rectSize}
            height={rectSize}
            fill="transparent"
          />
        )
      }

      case MaskType.ID_CARD: {
        // ID card shape with rounded corners
        const cardWidth = screenWidth * 0.9
        const cardHeight = cardWidth / 1.6 // Common ID/ Credit card size ratio
        return (
          <Rect
            x={centerX - cardWidth / 2}
            y={centerY - cardHeight}
            width={cardWidth}
            height={cardHeight}
            rx={15}
            ry={15}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={2}
          />
        )
      }
      case MaskType.QR_CODE: {
        const qrSize = screenWidth * 0.9
        return (
          <Rect
            x={centerX - qrSize / 2}
            y={centerY - qrSize / 1.5}
            width={qrSize}
            height={qrSize}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={2}
          />
        )
      }
      case MaskType.CUSTOM:
        return customPath ? <Path d={customPath} fill="transparent" /> : null

      default:
        return <Circle cx={centerX} cy={centerY} r={screenWidth / 2} fill="transparent" />
    }
  }

  return (
    <Svg width={screenWidth} height={screenHeight} style={{ position: 'absolute' }}>
      <Defs>
        <Mask id="overlayMask">
          {/* White background - visible area */}
          <Rect width={screenWidth} height={screenHeight} fill="white" />
          {/* Cutout  - transparent area */}
          {React.cloneElement(renderCutOutShape() as React.ReactElement, { fill: 'black' })}
        </Mask>
      </Defs>

      {/* Semi-transparent overlay with cutout */}
      <Rect
        width={screenWidth}
        height={screenHeight}
        fill={overlayColor}
        fillOpacity={overlayOpacity}
        mask="url(#overlayMask)"
      />

      {/* Guide lines or decorations */}
      {renderCutOutShape()}
    </Svg>
  )
}

export default SVGOverlay
