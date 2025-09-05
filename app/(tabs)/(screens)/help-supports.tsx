import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { themeStyle } from '@/theme';

export default function HelpSupports() {
  const section = {
    fontFamily: themeStyle.fontFamily.semibold,
    fontSize: themeStyle.fontSize.header2,
    color: themeStyle.colors.black,
    marginTop: 16,
    marginBottom: 8,
  } as const;

  const h3 = {
    fontFamily: themeStyle.fontFamily.semibold,
    fontSize: themeStyle.fontSize.description,
    color: themeStyle.colors.black,
    marginTop: 12,
    marginBottom: 6,
  } as const;

  const p = {
    fontFamily: themeStyle.fontFamily.regular,
    fontSize: themeStyle.fontSize.description,
    color: themeStyle.colors.black,
    lineHeight: 22,
    marginBottom: 10,
  } as const;

  const q = {
    fontFamily: themeStyle.fontFamily.semibold,
    fontSize: themeStyle.fontSize.description,
    color: themeStyle.colors.black,
    marginTop: 12,
    marginBottom: 4,
  } as const;

  return (
    <View style={{ flex: 1, }}>
      <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
        <View
          style={{
            backgroundColor: themeStyle.colors.white,
            width: '92%',
            alignSelf: 'center',
            borderRadius: 10,
            padding: 16,
          }}
        >
          <Text style={p}>
            Duweenext is designed to help you efficiently monitor and manage your duckweed ponds
            using real-time data from IoT sensors. To begin, download and install the app, then sign
            up or log in to access your dashboard. From there, you can connect your sensors and
            start receiving live updates on pH, EC, light, and temperature conditions. If you don’t
            have IoT sensors, you can manually enter pond data for basic monitoring. The app works
            on both Android and iOS and requires internet connectivity for real-time updates and
            cloud storage access.
          </Text>

          <Text style={section}>Common Issues & Solutions</Text>
          <Text style={p}>
            If you are experiencing issues with sensor data updates, first ensure that your ESP32
            board is powered on and properly connected. Check whether the backend services and EMQX
            MQTT broker are running correctly, and verify that your internet connection is stable.
            If your threshold alerts are not working, make sure that the correct values have been
            set in the app and that notifications are enabled on your mobile device. For image
            processing issues, confirm that your images are in supported formats such as JPEG or PNG
            and that the MinIO storage has sufficient space. If the issue persists, try restarting
            the app or checking for updates.
          </Text>

          <Text style={section}>Frequently Asked Questions (FAQs)</Text>

          <Text style={q}>1. Can I use Duweenext without IoT sensors?</Text>
          <Text style={p}>
            Yes! If you don’t have IoT sensors, you can still manually enter pond data for basic
            monitoring. While automatic sensor data collection provides more accuracy and
            convenience, manual input allows you to track pond conditions effectively.
          </Text>

          <Text style={q}>2. How often does the sensor data update?</Text>
          <Text style={p}>
            Sensor data updates occur at intervals based on your device settings and network
            connectivity. Typically, readings are refreshed every few minutes. If you notice a
            delay, check your internet connection and ensure that your sensors are properly synced.
          </Text>

          <Text style={q}>3. Is there a web version of Duweenext?</Text>
          <Text style={p}>
            Currently, Duweenext is available only as a mobile application. However, a web version
            is under development to provide additional flexibility for users who prefer to access
            their pond data on a computer.
          </Text>

          <Text style={q}>4. What should I do if my notifications are not working?</Text>
          <Text style={p}>
            If you are not receiving notifications, check that your threshold settings are
            configured correctly in the app. Also, ensure that notifications are enabled in your
            mobile device’s settings. If the issue persists, try restarting the app or reinstalling
            it.
          </Text>

          <Text style={q}>5. What types of images can I upload for analysis?</Text>
          <Text style={p}>
            Duweenext supports common image formats such as JPEG and PNG. If your images are not
            uploading or processing, check the file size and format. Also verify that the MinIO
            storage system is running properly.
          </Text>

          <Text style={q}>6. Can I integrate Duweenext with other farm management tools?</Text>
          <Text style={p}>
            Yes, Duweenext provides API access for developers who want to integrate the app with
            third-party tools or dashboards. For more information, please contact our support team
            via the in-app Help & Support section.
          </Text>
          <Text style={q}>7. How can I back up my pond data?</Text>
          <Text style={p}>All sensor readings and manually entered data are stored securely 
            in the cloud. You can export your data from the app if needed. In case of any issues, 
            contact our support team for assistance with data recovery.</Text>

          <Text style={q}>8. How do I update the app to the latest version?</Text>
          <Text style={p}>To ensure you’re using the latest features and improvements, always 
            keep your app updated. You can check for updates on the Google Play Store or Apple 
            App Store. If you experience any issues after an update, try reinstalling the app or 
            clearing the cache.</Text>

          <Text style={q}>9. Can multiple users access the same pond data?</Text>
          <Text style={p}>Yes, Duweenext supports multi-user access for farm management teams. 
            You can share access with team members and set different permission levels based on 
            their roles.</Text>

          <Text style={q}>10. How do I reset my password if I forget it?</Text>
          <Text style={p}>If you forget your password, go to the login screen and tap on Forgot 
            Password. Follow the instructions to reset your password via email. If you do not receive 
            a reset link, check your spam folder or contact support.</Text>
        </View>
      </ScrollView>
    </View>
  );
}
