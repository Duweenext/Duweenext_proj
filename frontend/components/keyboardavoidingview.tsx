import { View, Text, ScrollView, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView } from 'react-native'
import React from 'react'

const KeyboardAvoidingWrapper = ({ children }: { children: any }) => {
    return (
        <KeyboardAvoidingView>
            <ScrollView>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    {children}
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default KeyboardAvoidingWrapper