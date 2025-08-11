import React from 'react';
import { themeStyle } from '../../app/theme';
import {
  View,
  Text,
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
    name?: string;
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

// Convert hex to rgba for overlays/shadows
const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const bigint = parseInt(
    clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ModalChangeInformation: React.FC<ModalChangeInformationProps> = ({
  visible,
  title,
  titleColor = themeStyle.colors.fail,
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
      <View
        style={{
          flex: 1,
          backgroundColor: hexToRgba(themeStyle.colors.black, 0.3),
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 326,
            minHeight: 226,
            backgroundColor: themeStyle.colors.white,
            borderRadius: 15,
            paddingVertical: 28,
            paddingHorizontal: 20,
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              padding: 8,
              zIndex: 10,
            }}
          >
            <Image
              source={{
                uri: 'https://img.icons8.com/ios-filled/50/multiply.png',
              }}
              style={{
                width: 20,
                height: 20,
                tintColor: themeStyle.colors.black,
              }}
            />
          </TouchableOpacity>

          {/* Title */}
          <Text
            style={{
              fontSize: themeStyle.fontSize.header2,
              fontFamily: themeStyle.fontFamily.bold,
              color: titleColor,
              textShadowColor: hexToRgba(themeStyle.colors.black, 0.15),
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 2,
              marginBottom: 20,
            }}
          >
            {title}
          </Text>

          {/* Description */}
          {descriptionText && (
            <Text
              style={{
                fontSize: themeStyle.fontSize.data_text,
                fontFamily: themeStyle.fontFamily.regular,
                textAlign: 'center',
                marginBottom: 10,
                color: themeStyle.colors.black,
              }}
            >
              {descriptionText}
            </Text>
          )}

          {/* Email */}
          {email && (
            <Text
              style={{
                fontSize: themeStyle.fontSize.data_text,
                fontFamily: themeStyle.fontFamily.bold,
                color: themeStyle.colors.primary,
                marginBottom: 12,
              }}
            >
              {email}
            </Text>
          )}

          {/* Instruction */}
          {instructionText && (
            <Text
              style={{
                fontSize: themeStyle.fontSize.data_text,
                fontFamily: themeStyle.fontFamily.bold,
                color: themeStyle.colors.black,
                marginBottom: 10,
              }}
            >
              {instructionText}
            </Text>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Text
              style={{
                fontSize: 13,
                fontFamily: themeStyle.fontFamily.medium,
                color: themeStyle.colors.fail,
                marginBottom: 12,
              }}
            >
              {errorMessage}
            </Text>
          )}

          {/* Dynamic Fields */}
          {fields.map((field, idx) => {
            if (field.type === 'password') {
              return (
                <View key={`pwd-${idx}`} style={{ marginBottom: 16 }}>
                  <TextFieldModal
                    placeholder={field.placeholder || ''}
                    borderColor={
                      errorMessage
                        ? themeStyle.colors.fail
                        : themeStyle.colors.primary
                    }
                    textColor={themeStyle.colors.black}
                    value={field.value || ''}
                    onChangeText={field.onChangeText || (() => {})}
                    {...(field.name ? { name: field.name } : {})}
                  />
                </View>
              );
            }
            if (field.type === 'code') {
              return (
                <View key={`code-${idx}`} style={{ marginTop: 20 }}>
                  <TextFieldVerificationCode
                    length={6}
                    onCodeFilled={(code) => field.onChangeText?.(code)}
                    isError={!!errorMessage}
                  />
                </View>
              );
            }
            return null;
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

export default ModalChangeInformation;
