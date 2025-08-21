import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import TopBar from '@/component-v2/NavBar/TopBar';
import { themeStyle } from '@/theme';

export default function PrivacyPolicy() {
  const h1 = {
    fontFamily: themeStyle.fontFamily.semibold,
    fontSize: themeStyle.fontSize.header2,
    color: themeStyle.colors.black,
    marginBottom: 8,
  } as const;

  const h2 = {
    fontFamily: themeStyle.fontFamily.semibold,
    fontSize: themeStyle.fontSize.description,
    color: themeStyle.colors.black,
    marginTop: 14,
    marginBottom: 6,
  } as const;

  const p = {
    fontFamily: themeStyle.fontFamily.regular,
    fontSize: themeStyle.fontSize.description,
    color: themeStyle.colors.black,
    lineHeight: 22,
    marginBottom: 10,
  } as const;

  return (
    <View style={{ flex: 1, }}>
      <TopBar title="Privacy & Policy" />
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
            Welcome to Duweenext! Your privacy is important to us, and we are committed to
            protecting your personal data. This Privacy Policy explains how we collect, use, store,
            and share your information when you use our application. By using Duweenext, you agree
            to the terms of this Privacy Policy.
          </Text>

          <Text style={h1}>1. Information We Collect</Text>
          <Text style={p}>
            When you use Duweenext, we collect different types of information to improve your
            experience. This includes personal information such as your name, email address, phone
            number, and login credentials when you register for an account. Additionally, we collect
            sensor data from your IoT devices, including pH, EC, light, and temperature readings, to
            monitor your pond conditions. We may also gather technical data such as your device
            type, operating system, IP address, and usage patterns to optimize performance and
            enhance security.
          </Text>

          <Text style={h1}>2. How We Use Your Information</Text>
          <Text style={p}>
            We use the collected information to provide and improve our services. Your personal data
            helps us authenticate your account, manage your account, and communicate important
            updates. Sensor data is processed to generate real-time analytics, send notifications,
            and assist in pond management. We also analyze technical data to diagnose issues,
            enhance app performance, and ensure system security. Additionally, we may use your
            contact details to send promotional offers, updates, or support-related messages, but
            you can opt out of marketing communications at any time.
          </Text>

          <Text style={h1}>3. Data Sharing and Third-Party Services</Text>
          <Text style={p}>
            We do not sell or rent your personal data to third parties. However, we may share
            information with trusted service providers who assist us in running the application,
            such as cloud storage providers, analytics tools, and customer support services. These
            parties are required to protect your data and use it only for the intended purpose. If
            required by law, we may disclose your information to comply with legal obligations or
            protect our rights and the safety of users.
          </Text>

          <Text style={h1}>4. Data Storage and Security</Text>
          <Text style={p}>
            Your data is securely stored in our cloud infrastructure, utilizing industry-standard
            encryption and security measures. We take all necessary precautions to protect your
            personal and sensor data from unauthorized access, alteration, or loss. However, no
            system is completely secure, and we advise users to safeguard their account credentials
            and use strong passwords to enhance protection.
          </Text>

          <Text style={h1}>5. Your Rights and Choices</Text>
          <Text style={p}>
            As a user, you have the right to access, update, or delete your personal information at
            any time. You can manage your data settings through the app or contact our support team
            for assistance. If you wish to withdraw consent for certain data processing activities,
            you may do so through your account settings. However, some features of Duweenext may be
            affected if certain data collection is disabled.
          </Text>

          <Text style={h1}>6. Changes to This Privacy Policy</Text>
          <Text style={p}>
            We may update this Privacy Policy from time to time to reflect changes in our practices,
            legal requirements, or improvements to our services. We will notify you of material
            updates through the app or our official website. We encourage you to review this policy
            periodically to stay informed about how we protect your information.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
