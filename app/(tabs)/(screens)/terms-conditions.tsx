import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import TopBar from '@/src/component/NavBar/TopBar';
import { themeStyle } from '@/theme';

export default function TermsConditions() {
  const h1 = {
    fontFamily: themeStyle.fontFamily.semibold,
    fontSize: themeStyle.fontSize.header2,
    color: themeStyle.colors.black,
    marginTop: 10,
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
    <View style={{ flex: 1,}}>
      {/* <TopBar title="Term & Conditions" /> */}
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
            Welcome to Duweenext! These Terms & Conditions (“Terms”) govern your access to and use
            of the Duweenext mobile application and services. By downloading, installing, or using
            Duweenext, you agree to comply with these Terms. If you do not agree with any part of
            these Terms, please do not use the application.
          </Text>

          <Text style={h1}>1. Eligibility and Account Registration</Text>
          <Text style={p}>
            To use Duweenext, you must be at least 13 years old. If you are under 18, you must have
            permission from a parent or legal guardian. By creating an account, you agree to provide
            accurate and complete information and to keep your account details secure. You are
            responsible for all activities that occur under your account and must notify us
            immediately if you suspect unauthorized access.
          </Text>

          <Text style={h1}>2. Use of the Application</Text>
          <Text style={p}>
            Duweenext is designed to help users monitor and manage duckweed ponds using IoT sensors
            and manual data input. You agree to use the app only for its intended purposes and in
            compliance with all applicable laws. Unauthorized activities such as hacking, data
            scraping, reverse engineering, or any form of exploitation of the app’s services are
            strictly prohibited.
          </Text>

          <Text style={h1}>3. User Content and Data</Text>
          <Text style={p}>
            By using Duweenext, you may input sensor data, upload images, and provide other content.
            You retain ownership of your content, but you grant us a license to process, store, and
            display the data as necessary to provide our services. You are responsible for ensuring
            that your content does not violate any laws, infringe on third-party rights, or contain
            harmful material.
          </Text>

          <Text style={h1}>4. Data Privacy</Text>
          <Text style={p}>
            We take your privacy seriously. Our Privacy Policy explains how we collect, use, and
            protect your personal and sensor data. By using Duweenext, you acknowledge and agree to
            our data practices as described in the Privacy Policy.
          </Text>

          <Text style={h1}>5. Limitation of Liability</Text>
          <Text style={p}>
            Duweenext is provided on an “as-is” and “as-available” basis. While we strive to offer
            accurate and reliable services, we do not guarantee that the app will always be
            error-free, uninterrupted, or fully secure. We are not responsible for any loss, damage,
            or disruption caused by incorrect sensor data, system failures, or third-party services.
            Users are advised to verify critical data before making important decisions regarding
            pond management.
          </Text>

          <Text style={h1}>6. Intellectual Property Rights</Text>
          <Text style={p}>
            All content, trademarks, logos, and intellectual property within Duweenext belong to us
            or our licensors. You are granted a limited, non-exclusive, non-transferable license to
            use the app for personal or business use. You may not copy, modify, distribute, or
            create derivative works based on our content without written permission.
          </Text>

          <Text style={h1}>7. Third-Party Services and Links</Text>
          <Text style={p}>
            Duweenext may integrate with third-party services such as cloud storage providers,
            analytics tools, and payment processors. We are not responsible for the practices or
            content of these third-party services. Your interactions with them are governed by their
            respective terms and policies.
          </Text>

          <Text style={h1}>8. Changes to These Terms</Text>
          <Text style={p}>
            We may update these Terms from time to time. Continued use of Duweenext after updates
            constitutes your acceptance of the revised Terms. We will notify you of material changes
            through the app or our website. We encourage you to review the Terms periodically.
          </Text>

          <Text style={h1}>9. Governing Law and Dispute Resolution</Text>
          <Text style={p}>
            These Terms shall be governed by and interpreted in accordance with the laws of Thailand. 
            Any disputes arising from these Terms will be resolved through arbitration or legal 
            proceedings in Thailand.
          </Text>

          <Text style={h1}>10. Contact Us</Text>
          <Text style={p}>
            If you have any questions about these Terms, please contact our support team via the
            in-app Help & support section or at support@duweenext.app.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
