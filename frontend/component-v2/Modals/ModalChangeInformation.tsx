import React from 'react';
import {theme} from '@/theme';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  GestureResponderEvent,
} from 'react-native';
import TextFieldVerificationCode from '../TextFields/TextFieldVerificationCode';
import ButtonUnderline from '../Buttons/ButtonUnderline';
import TextFieldModal from '../TextFields/TextFieldModal';
import ButtonModalL from '../Buttons/ButtonModalL';

interface ModalChangeInformationProps {
  visible: boolean;
  title: string;
  titleColor?: string;
  descriptionText?: string;
  instructionText?: string;
  errorMessage?: string;
  email?: string;
  onClose: () => void;
  fields?: {
    type: 'password' | 'code';
    name?:string;
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
  }[];
   underlineButton?: {
    text: string;
    onPress: (event: GestureResponderEvent) => void;
  };
  button?: {
    text: string;
    onPress: (event: GestureResponderEvent) => void;
    filledColor?: string;
    textColor?: string;
  };
 
}

const ModalChangeInformation: React.FC<ModalChangeInformationProps> = ({
  visible,
  title,
  titleColor = '#F26B6B',
  descriptionText,
  instructionText,
  errorMessage,
  email,
  onClose,
  fields = [],
  button,
  underlineButton,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Cancel Icon */}
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Image
              source={{
                uri: 'https://img.icons8.com/ios-filled/50/multiply.png',
              }}
              style={styles.icon}
            />
          </TouchableOpacity>

          {/* Title */}
          <Text style={[styles.title, { color: titleColor }, {marginBottom: 20}]}>{title}</Text>

          {/* Description */}
          {descriptionText && (
            <Text style={styles.description}>{descriptionText}</Text>
          )}
          {email && (
          <Text style={styles.emailText}>{email}</Text>
          )}


          {/* Instruction */}
          {instructionText && (
            <Text style={styles.instruction}>{instructionText}</Text>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Text style={[styles.errorMessage, {marginBottom: 12}]}>{errorMessage}</Text>
          )}

          {/* Dynamic Fields */}
          {fields.map((field, idx) => {
            if (field.type === 'password') {
              return (
              <View key={idx} style={{ marginBottom: 16 }}> 
               <TextFieldModal
                key={idx}
                placeholder={field.placeholder || ''}
                borderColor={errorMessage ? theme.colors.red : theme.colors.primary}
                textColor={theme.colors.secondary}
                value={field.value || ''}
                onChangeText={field.onChangeText || (() => {})}
                {...(field.name ? { name: field.name } : {})} //only spreads if `name` exists
              />
              </View>

              );
            }
            if (field.type === 'code') {
              return (
                <View style={{ marginTop: 20 }}>
                <TextFieldVerificationCode
                  key={idx}
                  length={6}
                  onCodeFilled={(code) => field.onChangeText?.(code)}
                  isError={!!errorMessage}
                />
                </View>
              );
            }
          })}
           {/* Underline Button */}
          {underlineButton && (
            <View style={{ marginTop: 20 }}>
            <ButtonUnderline
              text={underlineButton.text}
              onPress={underlineButton.onPress}
            />
            </View>
          )}

          {/* Primary Button */}
          {button && (
            <View style={{ marginTop: 50 }}>
            <ButtonModalL
              text={button.text}
              filledColor={button.filledColor}
              textColor={button.textColor}
              onPress={button.onPress}
            />
            </View>
          )}

         
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
    minHeight: 226,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 8,
    zIndex: 10,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#000',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  instruction: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  emailText: {
  fontSize: 14,
  color: '#227C71', // or theme.colors.primary
  fontWeight: 'bold',
  marginBottom: 12,
},
  errorMessage: {
    fontSize: 13,
    color: '#F26B6B',
    marginBottom: 6,
  },
});

export default ModalChangeInformation;
