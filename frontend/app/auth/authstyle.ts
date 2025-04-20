import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
    outerbox: {
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        justifyContent: 'space-around',
        paddingTop: 10,
        paddingBottom: 10,
    },
    innerbox: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 10,
        paddingHorizontal: 50,
    },
    logo_section: {
        alignSelf: 'center',
        width: 250,
        height: 250,
        borderRadius: 150,
        marginBottom: 20
    },
    input_section: {
        width: '100%'
    },
    input_box: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 15,
        width: '100%',
    },
    text_input_box: {
        borderRadius: 15,
        minWidth: '80%',
    },
    input_header: {
        fontWeight: 'bold',
        fontSize: 20
    },
    password_visibility_toggle: {
        width: 25,
        height: 25
    },
    button_section: {
        alignSelf: 'center',
        marginTop: 40,
        alignItems: 'center',
        gap: 15
    },
    login_button: {
        backgroundColor: '#1A736A',
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 69
    },
    register_button: {
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 2,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 60,
    },
    login_button_text: {
        fontWeight: 'bold',
        color: '#ffffff'
    },
    register_button_text: {
        fontWeight: 'bold',
        color: '#000000',
        textDecorationLine: 'underline',
    },
    register_text_section:{
        flexDirection: 'row',
        justifyContent: 'center',
    },
    warning_text: {
        fontWeight: 'regular',
        color: '#ffffff',
        fontSize: 15
    },
    register_text_link:{
        fontWeight: 'medium',
        fontSize: 15,
        color:'#48CAE4',
        textDecorationLine: 'underline'
    },
    other_option_section: {
        alignSelf: 'center',
        alignItems: 'center',
        gap: 20,
    },
    google_button: {
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 12,
        paddingHorizontal: 90,
    },
    google_button_content_section: {
        flexDirection: 'row',
        gap: 10
    },
    google_text: {
        fontWeight: 'bold',
        color: '#000000',
    },
    google_image: {
        width: 20,
        height: 20
    }
})

export default style;