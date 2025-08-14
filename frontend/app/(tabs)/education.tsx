// app/education/index.tsx
//Related files include:
//[slug].tsx in education folder inside (screens) inside app
//education.ts in educationData in src
//typesEducation.ts in educationData in src
//CardEducation.tsx in Card folder inside component-v2
import React from 'react';
import { View, FlatList, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import CardEducation from '../../component-v2/Card/CardEducation';
import { EDUCATION_TOPICS } from '../../src/data/educationData';

const Education = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        </View>
    )
}

const styles = StyleSheet.create({
  container: { flex: 1,} //backgroundColor: '#053f3a' }, // optional bg to match mock
});
