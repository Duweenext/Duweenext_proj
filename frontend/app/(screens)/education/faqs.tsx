import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { themeStyle } from '@/src/theme';
import { FAQS } from '@/src/data/faqs';
import TopBar from '@/src/component/NavBar/TopBar';

export default function FAQPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: themeStyle.colors.white }}>
      <TopBar title="FAQs" />
      <ScrollView style={{ padding: 18 }}>
        {FAQS.map((faq, idx) => {
          const isOpen = expanded === faq.id;
          return (
            <View
              key={faq.id}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#ddd',
                paddingVertical: 12,
              }}
            >
              <TouchableOpacity onPress={() => setExpanded(isOpen ? null : faq.id)}>
                <View
                  style={{
                    backgroundColor: themeStyle.colors.primary,
                    borderRadius: 5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: themeStyle.fontSize.description,
                      fontFamily: themeStyle.fontFamily.regular,
                      color: themeStyle.colors.white,
                      padding: 10,
                    }}
                  >
                    {idx + 1}. {faq.q}
                  </Text>
                </View>
              </TouchableOpacity>

              {isOpen && (
                <Text
                  style={{
                    marginTop: -8,
                    fontSize: themeStyle.fontSize.description,
                    color: themeStyle.colors.black,
                    borderWidth: 1,
                    borderColor: themeStyle.colors.primary,
                    borderRadius: 5,
                    padding: 10,
                  }}
                >
                  {'  '}
                  {faq.a}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
