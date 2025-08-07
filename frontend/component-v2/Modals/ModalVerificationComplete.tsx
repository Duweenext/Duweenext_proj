import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
} from 'react-native';

const ModalVerificationComplete: React.FC = () => {
  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Verification complete</Text>
          <Text style={styles.subtext}>you will be redirect to homepage soon</Text>
          <Image
            source={{
              uri: 'https://cdn-icons-png.freepik.com/256/13983/13983889.png?semt=ais_white_label',
            }}
            style={styles.icon}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: 326,
    height: 226,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingTop: 28,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 50,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E5D52', // matching the design
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  subtext: {
    fontSize: 14,
    color: '#333333',
    marginTop: 8,
  },
  icon: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
});

export default ModalVerificationComplete;
