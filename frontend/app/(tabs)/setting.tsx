import { View, Text } from 'react-native'
import React from 'react'
import { SettingCard } from '@/component-v2/Card/SettingCard'
import { router } from 'expo-router'

const Setting = () => {
    const title = [
        {id: 1,title: 'Manage Profile ', route: '/(screens)/profile_setting'},
        {id: 2,title: 'Manage Notifications', route: '/(screens)/notification_setting'},
        {id: 3,title: 'Help & Supports', route: '/(screens)/help_support'},
        {id: 4,title: 'Privacy Policy', route: '/(screens)/privacy_policy'},
        {id: 5,title: 'Terms & Conditions', route: '/(screens)/terms_conditions'},
        {id: 6,title: 'Language', route: ''},
    ]

    return (
        <View style={{ flex: 1, padding: 20 }}>
            {
                title.map(item => (
                   <View style={{ marginBottom: 12 }}>
                       <SettingCard
                           key={item.id}
                           title={item.title}
                           onPress={() => {item.route ? router.navigate(item.route as any) : null}}
                       />
                   </View>
                ))
            }
        </View>
    )
}

export default Setting