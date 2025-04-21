import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react'

const StyledContainer = () => {
    return (
        <View style={style.container}>
            <LinearGradient
                colors={['#DEFFFD', '#95E7E7', '#087979']}
                locations={[0, 0.25, 0.65]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={style.gradientOverlay}
            />
        </View>
    )
}
const style = StyleSheet.create({
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: "100%",
    },
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    component_section: {
        flex: 0.5,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 70,
    },
    text_input_section: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    logo: {
        width: 250,
        height: 250,
        borderRadius: 150
    }
})

export default StyledContainer