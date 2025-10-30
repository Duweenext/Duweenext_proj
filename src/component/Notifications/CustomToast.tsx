import { theme } from '@/src/theme';
import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import LottieView from 'lottie-react-native';

interface CustomToastProps {
    text1?: string;
    text2?: string;
    props: {
        lottieSource?: any;
    };
}

const CustomToast: React.FC<CustomToastProps> = ({ text1, text2, props }) => {
    return (
        <View style={styles.container}>
            {props.lottieSource && (
                <LottieView
                    source={props.lottieSource}
                    autoPlay // The animation will play as soon as it's loaded
                    loop={true} // Set to true if you want it to loop continuously
                    style={styles.lottie}
                />
            )}

            <View style={styles.textContainer}>
                {text1 && <Text style={styles.titleText}>{text1}</Text>}
                {text2 && <Text style={styles.bodyText}>{text2}</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        minHeight: 80,
        width: '90%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },

        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    lottie: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    icon: {
        width: 50,
        height: 50,
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    titleText: {
        fontSize: theme.fontSize.description,
        color: '#333',
        fontFamily: theme.fontFamily.medium
    },
    bodyText: {
        fontSize: theme.fontSize.body,
        color: '#666',
        fontFamily: theme.fontFamily.regular
    },
});

export default CustomToast;