import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import { themeStyle } from '@/src/theme';

type Props = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  iconUri?: string;               // for success/checkmark images
  iconNode?: React.ReactNode;     // optional custom icon component
  primaryColor?: string;
  onClose?: () => void;
  button?: {
    text: string;
    onPress?: (e: GestureResponderEvent) => void;
    filledColor?: string;
    textColor?: string;
  };
  autoDismissMs?: number;
};

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ModalSuccessTemplate: React.FC<Props> = ({
  visible,
  title = 'Success',
  subtitle,
  iconUri = 'https://cdn-icons-png.flaticon.com/512/5610/5610944.png',
  iconNode,
  primaryColor = themeStyle.colors.primary,
  onClose,
  button,
  autoDismissMs,
}) => {
  useEffect(() => {
    if (!visible || !autoDismissMs) return;
    const id = setTimeout(() => onClose?.(), autoDismissMs);
    return () => clearTimeout(id);
  }, [visible, autoDismissMs, onClose]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: hexToRgba(themeStyle.colors.black, 0.3),
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            width: 326,
            minHeight: 226,
            backgroundColor: themeStyle.colors.white,
            borderRadius: 15,
            paddingTop: 28,
            paddingBottom: button ? 24 : 40,
            paddingHorizontal: 20,
            alignItems: 'center',
            shadowColor: themeStyle.colors.black,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 10,
            position: 'relative', // Needed for positioning cross icon
          }}
        >
          {/* Cancel Cross Icon */}
          {onClose && (
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
                source={{ uri: 'https://img.icons8.com/ios-filled/50/multiply.png' }}
                style={{ width: 20, height: 20, tintColor: themeStyle.colors.black }}
              />
            </TouchableOpacity>
          )}

          {/* Title */}
          <Text
            style={{
              fontSize: themeStyle.fontSize.header2,
              fontFamily: themeStyle.fontFamily.bold,
              color: primaryColor,
              textAlign: 'center',
              textShadowColor: hexToRgba(themeStyle.colors.black, 0.15),
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 2,
              marginTop: 8,
            }}
          >
            {title}
          </Text>

          {/* Subtitle */}
          {subtitle ? (
            <Text
              style={{
                marginTop: 8,
                fontSize: themeStyle.fontSize.data_text,
                fontFamily: themeStyle.fontFamily.regular,
                color: themeStyle.colors.black,
                textAlign: 'center',
              }}
            >
              {subtitle}
            </Text>
          ) : null}

          {/* Icon */}
          <View style={{ marginBottom: 16, marginTop: 20 }}>
            {iconNode ? (
              iconNode
            ) : (
              <Image
                source={{ uri: iconUri }}
                style={{ width: 80, height: 80, resizeMode: 'contain' }}
              />
            )}
          </View>

          {/* Action Button */}
          {button ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={(e) => button.onPress ? button.onPress(e) : onClose?.()}
              style={{
                marginTop: 24,
                width: 200,
                height: 44,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: button.filledColor ?? primaryColor,
              }}
            >
              <Text
                style={{
                  fontSize: themeStyle.fontSize.description,
                  fontFamily: themeStyle.fontFamily.bold,
                  color: button.textColor ?? themeStyle.colors.white,
                }}
              >
                {button.text}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default ModalSuccessTemplate;
