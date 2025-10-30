// app/(screens)/education/[slug].tsx

import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTopicBySlug } from '../../../../src/data/educationData';
import type { EduSection } from '../../../../src/interfaces/typesEducation'; // Adjust path if needed
import { themeStyle } from '../../../../src/theme';
// REFINED: Import the hook, not the 't' function directly
import { useTranslation } from 'react-i18next';

export default function EducationDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  // REFINED: Instantiate the hook to get the 't' function
  const { t } = useTranslation();

  const topic = useMemo(() => getTopicBySlug(slug ?? ''), [slug]);

  if (!topic) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {/* REFINED: Use a key for this text as well, for consistency */}
        <Text>{t('common.topicNotFound')}</Text> 
      </View>
    );
  }

  const headerBg = themeStyle.colors.primary;
  const bodyBorder = themeStyle.colors.black;
  const TOPBAR_HEIGHT = 56;

  return (
    <>
      <Stack.Screen options={{ title: 'Education' }} />

      <View style={{ flex: 1, backgroundColor: themeStyle.colors.white }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + TOPBAR_HEIGHT + 28,
            paddingBottom: 16,
            paddingHorizontal: 12,
            backgroundColor: themeStyle.colors.white,
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            minHeight: '100%',
          }}
        >
          {/* Page Title */}
          <View style={{ width: '92%', alignItems: 'center' }}>
            <Text style={{
              fontFamily: themeStyle.fontFamily.bold,
              fontSize: themeStyle.fontSize.header1,
              marginTop: 18,
              marginBottom: 12,
              color: themeStyle.colors.primary,
              textAlign: 'center', // Added for better centering
            }}>
              {/* REFINED: Use the new 'titleKey' property */}
              {t(topic.titleKey)}
            </Text>
          </View>

          {/* Hero Icon */}
          <View style={{
            width: '45%',
            alignItems: 'center',
            paddingVertical: 16,
            borderWidth: 1,
            borderColor: headerBg,
            borderRadius: 16,
            backgroundColor: themeStyle.colors.white,
          }}>
            <Image
              source={topic.heroIcon}
              style={{ width: 100, height: 100, resizeMode: 'contain' }}
            />
          </View>

          {/* Tagline */}
          {/* REFINED: Use 'taglineKey' and check if it exists */}
          {topic.taglineKey && t(topic.taglineKey) && (
            <Text style={{
              textAlign: 'center',
              color: themeStyle.colors.fail,
              fontFamily: themeStyle.fontFamily.medium,
              fontSize: themeStyle.fontSize.descriptionL,
              marginTop: 10,
              marginBottom: 16,
              width: '80%',
            }}>
              {`"${t(topic.taglineKey)}"`}
            </Text>
          )}

          {/* Sections as cards */}
          <View style={{ width: '92%', alignSelf: 'center', marginTop: 20 }}>
            {/* REFINED: Simplified map, no need for fallback logic */}
            {topic.sections.map((section, idx) => (
              <Section
                key={idx}
                section={section}
                headerBg={headerBg}
                bodyBorder={bodyBorder}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

// REFINED: Updated the props for the Section component to use keys
const Section = ({
  section,
  headerBg,
  bodyBorder,
}: {
  section: {
    kind: string;
    titleKey?: string;
    textKey?: string;
    itemsKey?: string;
  };
  headerBg: string;
  bodyBorder: string;
}) => {
  // REFINED: Must also get the 't' function here
  const { t } = useTranslation();

  const Header = () =>
    // REFINED: Check for 'titleKey'
    !!section.titleKey ? (
      <View style={{
        backgroundColor: headerBg,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}>
        <Text style={{
          color: themeStyle.colors.white,
          fontFamily: themeStyle.fontFamily.semibold,
          fontSize: themeStyle.fontSize.description,
        }}>
          {/* REFINED: Translate using 'titleKey' */}
          {t(section.titleKey)}
        </Text>
      </View>
    ) : null;

  const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <View style={{
      backgroundColor: themeStyle.colors.white,
      padding: 12,
      borderWidth: 1,
      borderColor: bodyBorder,
      borderTopWidth: 0,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      marginBottom: 16,
    }}>
      {children}
    </View>
  );

  switch (section.kind) {
    case 'paragraph':
      return (
        <View style={{ alignSelf: 'stretch' }}>
          <Header />
          <Body>
            <Text style={{
              fontFamily: themeStyle.fontFamily.regular,
              fontSize: themeStyle.fontSize.description,
              color: themeStyle.colors.black,
              lineHeight: 22,
            }}>
              {/* REFINED: Translate using 'textKey' */}
              {section.textKey ? t(section.textKey) : ''}
            </Text>
          </Body>
        </View>
      );

    case 'bullets':
      // REFINED: The correct way to translate and render a list
      const bulletItems = section.itemsKey ? t(section.itemsKey, { returnObjects: true }) as string[] : [];
      return (
        <View style={{ alignSelf: 'stretch' }}>
          <Header />
          <Body>
            {Array.isArray(bulletItems) && bulletItems.map((item, i) => (
              <Text
                key={i}
                style={{
                  fontFamily: themeStyle.fontFamily.regular,
                  fontSize: themeStyle.fontSize.description,
                  color: themeStyle.colors.black,
                  lineHeight: 22,
                  marginTop: i === 0 ? 0 : 4,
                }}>
                {`\u2022 ${item}`}
              </Text>
            ))}
          </Body>
        </View>
      );

    // Note: 'quote' kind was not in your data structure, but if you add it,
    // remember to use 'textKey' as well.
    default:
      return null;
  }
};