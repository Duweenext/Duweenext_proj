import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/src/auth/context/auth_context';

export default function TokenDebugScreen() {
  const { getTokenInfo, logout } = useAuth();
  
  const tokenInfo = getTokenInfo();
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>JWT Token Debug</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Token Status:</Text>
        <Text style={[styles.value, { color: tokenInfo.isValid ? 'green' : 'red' }]}>
          {tokenInfo.isValid ? 'Valid' : 'Invalid'}
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Expired:</Text>
        <Text style={[styles.value, { color: tokenInfo.isExpired ? 'red' : 'green' }]}>
          {tokenInfo.isExpired ? 'Yes' : 'No'}
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Time Remaining:</Text>
        <Text style={styles.value}>{tokenInfo.timeRemaining}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Expiration Date:</Text>
        <Text style={styles.value}>{tokenInfo.expirationDate}</Text>
      </View>
      
      {tokenInfo.payload && (
        <View style={styles.section}>
          <Text style={styles.label}>Token Payload:</Text>
          <Text style={styles.code}>
            {JSON.stringify(tokenInfo.payload, null, 2)}
          </Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  value: {
    fontSize: 14,
    color: '#666',
  },
  code: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
