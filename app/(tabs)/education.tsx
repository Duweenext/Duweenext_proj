import React from 'react';
import { View, FlatList, Dimensions, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { EDUCATION_TOPICS } from '../../src/data/educationData';
import CardEducation from '@/src/component/Card/CardEducation';
import CardFAQ from '@/src/component/Card/CardFAQ';
import { useTranslation } from 'react-i18next';

const spacing = 12;
const numColumns = 2;
const cardWidth = (Dimensions.get('window').width - spacing * (numColumns + 1)) / numColumns;

export default function EducationIndex() {
  const router = useRouter();
  // REFINED: Get the 't' function from the hook
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{ padding: spacing }}
        columnWrapperStyle={{ gap: spacing }}
        data={EDUCATION_TOPICS}
        keyExtractor={(item) => item.slug}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <CardEducation
            title={t(item.titleKey)} 
            icon={item.heroIcon}
            onPress={() => router.push({ pathname: '/education/[slug]', params: { slug: item.slug } })}
            style={{ width: cardWidth }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing }} />}
        ListFooterComponent={
          <View style ={{paddingTop: 30,}}>
          <CardFAQ
            title={t('faqs.title')} 
            onPress={() => router.push('/education/faqs')}
          />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,}
});
