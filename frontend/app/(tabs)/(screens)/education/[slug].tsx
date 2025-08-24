// app/(screens)/education/[slug].tsx
import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTopicBySlug } from '../../../../src/data/educationData';
import type { EduSection } from '../../../../src/interfaces/typesEducation'; // or your updated path
import { themeStyle } from '../../../../src/theme';
import TopBar from '@/src/component/NavBar/TopBar';

export default function EducationDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const topic = useMemo(() => getTopicBySlug(slug ?? ''), [slug]);

  if (!topic) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Topic not found.</Text>
      </View>
    );
  }

  const headerBg = themeStyle.colors.primary; // teal header bar
  const bodyBorder = themeStyle.colors.black; // thin body border color
  const TOPBAR_HEIGHT = 56; // adjust if your TopBar is taller/shorter

  return (
    <>
      <Stack.Screen options={{ title: 'Education' }} />

      {/* Root stays white; TopBar will overlay on top */}
      <View style={{ flex: 1, backgroundColor: themeStyle.colors.white }}>
        <ScrollView
          contentContainerStyle={{
            // ensure content starts below the overlaid TopBar
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
          <View style={{
            width: '92%',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontFamily: themeStyle.fontFamily.bold,
              fontSize: themeStyle.fontSize.header1,
              marginTop: 18,
              marginBottom: 12,
              color: themeStyle.colors.primary,
              alignItems: 'center',
            }}
          >
            {topic.title}
          </Text>
          </View>
          {/* Hero Icon in rounded bordered box */}
          <View
            style={{
              width: '45%',
              alignItems: 'center',
              paddingVertical: 16,
              borderWidth: 1,
              borderColor: headerBg,
              borderRadius: 16,
              backgroundColor: themeStyle.colors.white,
            }}
          >
            <Image
              source={topic.heroIcon}
              style={{ width: 100, height: 100, resizeMode: 'contain' }}
            />
          </View>

          {/* Tagline in pink */}
          {!!topic.tagline && (
            <Text
              style={{
                textAlign: 'center',
                color: themeStyle.colors.fail,
                fontFamily: themeStyle.fontFamily.medium,
                fontSize: themeStyle.fontSize.descriptionL,
                marginTop: 10,
                marginBottom: 16,
                width: '80%',
              }}
            >
              {`"${topic.tagline}"`}
            </Text>
          )}

          {/* Sections as cards */}
          <View style={{ width: '92%', alignSelf: 'center', marginTop: 20 }}>
            {topic.sections.map((s, idx) => {
              const fallbackTitle =
                (s as any).title ??
                (idx === 0 && s.kind !== 'quote' ? `What is ${topic.title}?` : undefined);

              return (
                <Section
                  key={idx}
                  section={{ ...(s as any), title: fallbackTitle }}
                  headerBg={headerBg}
                  bodyBorder={bodyBorder}
                />
              );
            })}
          </View>
        </ScrollView>

        {/* TopBar OVERLAY (absolute, above ScrollView) */}
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            elevation: 16, // Android stacking
          }}
        >
          {/* <TopBar title="Education" /> */}
        </View>
      </View>
    </>
  );
}

const Section = ({
  section,
  headerBg,
  bodyBorder,
}: {
  section: EduSection & { title?: string };
  headerBg: string;
  bodyBorder: string;
}) => {
  const Header = () =>
    !!section.title ? (
      <View
        style={{
          backgroundColor: headerBg,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Text
          style={{
            color: themeStyle.colors.white,
            fontFamily: themeStyle.fontFamily.semibold,
            fontSize: themeStyle.fontSize.description,
          }}
        >
          {section.title}
        </Text>
      </View>
    ) : null;

  const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <View
      style={{
        backgroundColor: themeStyle.colors.white,
        padding: 12,
        borderWidth: 1,
        borderColor: bodyBorder,
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        marginBottom: 16,
      }}
    >
      {children}
    </View>
  );

  switch (section.kind) {
    case 'paragraph':
      return (
        <View style={{ alignSelf: 'stretch' }}>
          <Header />
          <Body>
            <Text
              style={{
                fontFamily: themeStyle.fontFamily.regular,
                fontSize: themeStyle.fontSize.description,
                color: themeStyle.colors.black,
                lineHeight: 22,
              }}
            >
              {section.text}
            </Text>
          </Body>
        </View>
      );

    case 'bullets':
      return (
        <View style={{ alignSelf: 'stretch' }}>
          <Header />
          <Body>
            {(section.items || []).map((it, i) => (
              <Text
                key={i}
                style={{
                  fontFamily: themeStyle.fontFamily.regular,
                  fontSize: themeStyle.fontSize.description,
                  color: themeStyle.colors.black,
                  lineHeight: 22,
                  marginTop: i === 0 ? 0 : 4,
                }}
              >
                {`\u2022 ${it}`}
              </Text>
            ))}
          </Body>
        </View>
      );

    case 'quote':
      return (
        <Text
          style={{
            marginTop: 12,
            fontStyle: 'italic',
            textAlign: 'center',
            color: '#8c3a3a',
          }}
        >
          {section.text}
        </Text>
      );

    default:
      return null;
  }
};
