import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { themeStyle } from '@/src/theme';
import { FAQS } from '@/src/data/faqs';
import { useTranslation } from 'react-i18next';

export default function FAQPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, backgroundColor: themeStyle.colors.white }}>
      <ScrollView style={{ padding: 18 }}>
        {FAQS.map((faq, idx) => {
          const isOpen = expanded === faq.id;
          
          // Dynamically create the translation keys
          const questionKey = `faqs.${faq.id}.q`;
          const answerKey = `faqs.${faq.id}.a`;

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
                      lineHeight: 20, // Added for better spacing
                    }}
                  >
                    {/* Use the t() function with the dynamic key */}
                    {idx + 1}. {t(questionKey)}
                  </Text>
                </View>
              </TouchableOpacity>

              {isOpen && (
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: themeStyle.fontSize.description,
                    color: themeStyle.colors.black,
                    backgroundColor: '#f9f9f9', // Lighter background for answer
                    borderColor: themeStyle.colors.primary,
                    borderWidth: 1,
                    borderRadius: 5,
                    padding: 10,
                    lineHeight: 22, // Added for readability
                  }}
                >
                  {/* Use the t() function with the dynamic key */}
                  {t(answerKey)}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}