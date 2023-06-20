import React from 'react'
import { Platform, View } from 'react-native'

import { useTheme } from '../../contexts/theme'



const IOSStatusBar: React.FC = ({ ...props }) => {
    const { ColorPallet } = useTheme()
    return (
        <>
            {Platform.OS === "ios" && <View style={{ height: 40, backgroundColor: ColorPallet.brand.primary }} {...props}></View>}
        </>
    )
}

export default IOSStatusBar
