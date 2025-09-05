import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CustomToast({ text1, text2 }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{text1}</Text>
      {text2 ? <Text style={styles.subtitle}>{text2}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: '#1E88E5', // 👈 custom bg
    padding: 16,
    borderRadius: 12,
    alignSelf: 'center',
  },
  title: {
    fontSize: 20, // 👈 custom size
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#eee',
    marginTop: 4,
  },
});
