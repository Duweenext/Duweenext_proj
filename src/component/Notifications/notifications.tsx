import React, { useState, useEffect } from 'react';
import { Animated, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

let showNotification: (data: any) => void;

export const InAppNotificationManager = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<{ title?: string; body?: string }>({});
  const translateY = new Animated.Value(-200);

  showNotification = (payload) => {
    setData(payload);
    setVisible(true);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -200,
        useNativeDriver: true,
        duration: 300,
      }).start(() => setVisible(false));
    }, 4000);
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <TouchableOpacity onPress={() => setVisible(false)}>
        <View style={styles.card}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.body}>{data.body}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export { showNotification };

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    color: '#111',
  },
  body: {
    fontSize: 14,
    color: '#555',
  },
});
