import React from 'react';
import { View, FlatList, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { EDUCATION_TOPICS } from '../../src/data/educationData';
import CardEducation from '@/src/component/Card/CardEducation';
import CardFAQ from '@/src/component/Card/CardFAQ';

const spacing = 12;
const numColumns = 2;
const cardWidth = (Dimensions.get('window').width - spacing * (numColumns + 1)) / numColumns;

export default function EducationIndex() {
  const router = useRouter();

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
            title={item.title}
            icon={item.heroIcon}
            onPress={() => router.push({ pathname: '/education/[slug]', params: { slug: item.slug } })}
            style={{ width: cardWidth }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing }} />}
        ListFooterComponent={
          <View style ={{paddingTop: 30,}}>
          <CardFAQ
            title="FAQs From Farmers"
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
