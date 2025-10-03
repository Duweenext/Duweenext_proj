import React, { useState, useRef, useEffect } from 'react';
import { Text, TextInput, View, Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { themeStyle } from '@/src/theme';
import { getPasswordStrength } from '@/src/utlis/passwordStrength';
import { strengthColorMap, strengthPercentMap, validateEmail, validateText } from '@/src/utlis/input';
import AnchoredPopover from './PasswordStrength/Popup';
import RulesCard, { RulesCardProps } from './PasswordStrength/RuleCard';

type PasswordVariant = 'default' | 'old' | 'confirm';
type ErrorPlacement = 'above' | 'below' | 'topRight';

type Props = {
  name: string;
  hint?: string;
  placeholder?: string;
  icon?: boolean;
  showStrengthRules?: boolean;
  type?: 'text' | 'email' | 'password';
  passwordVariant?: PasswordVariant;
  confirmWith?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  value: string;
  onChangeText: (text: string) => void;
  onMatchChange?: (matched: boolean) => void;
  errorPlacement?: ErrorPlacement;
  externalError?: string;                 // may be a translated string OR an i18n key
  ruleData?: RulesCardProps;
  translateErrors?: boolean;              // NEW: if true, try to translate error strings/keys
};

const TextFieldPrimary: React.FC<Props> = ({
  name,
  placeholder = '',
  icon = true,
  showStrengthRules = true,
  type = 'text',
  passwordVariant = 'default',
  confirmWith = '',
  width = 325,
  height = 60,
  borderRadius = 10,
  value,
  onChangeText,
  onMatchChange,
  errorPlacement = 'below',
  externalError,
  ruleData,
  translateErrors = true,
}) => {
  const { t } = useTranslation();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const isEmail = type === 'email';
  const isText = type === 'text';
  const nameRef = useRef<View>(null);

  const isConfirm = isPassword && passwordVariant === 'confirm';
  const matched =
    isConfirm && localValue.length > 0 ? localValue === confirmWith : false;

  useEffect(() => {
    if (isConfirm && onMatchChange) onMatchChange(matched);
  }, [isConfirm, matched, onMatchChange]);

  const handleInputChange = (text: string) => {
    setLocalValue(text);
    let err = '';

    if (isText) {
      err = validateText(text);                 // may return a literal message
    } else if (isEmail) {
      const { error: emailError, cleaned } = validateEmail(text);
      err = emailError;
      text = cleaned;
    }
    setErrorMessage(err);
    if (!err || text === '') onChangeText(text);
  };

  // If you pass i18n keys (e.g., "errors.passwordRequired"), this will translate them.
  // If you pass already-translated strings, this will return them unchanged.
  const trErr = (msg?: string) =>
    !msg
      ? ''
      : translateErrors
        ? t(msg, { defaultValue: msg })
        : msg;

  const computedErrorRaw = externalError || errorMessage;
  const computedError = trErr(computedErrorRaw);

  const baseBorder = '#d1d5db';
  const focusBorder = themeStyle.colors.primary;
  const errorBorder = themeStyle.colors.fail;
  const successBorder = themeStyle.colors.success;

  let borderColor = baseBorder;
  if (computedError) borderColor = errorBorder;
  if (isPassword) {
    if (passwordVariant === 'confirm' && localValue.length > 0) {
      borderColor = matched ? successBorder : errorBorder;
    } else if (isFocused && !computedError) {
      borderColor = focusBorder;
    }
  } else if (isFocused && !computedError) {
    borderColor = focusBorder;
  }

  const showEye = icon && isPassword;

  const ErrorText = () =>
    computedError ? (
      <Text
        style={{
          color: themeStyle.colors.fail,
          fontSize: themeStyle.fontSize.data_text,
          fontFamily: themeStyle.fontFamily.medium,
        }}
      >
        {computedError}
      </Text>
    ) : null;

  return (
    <View style={{ width: '100%', paddingHorizontal: 16, paddingVertical: 10 }}>
      {/* Label + optional topRight error */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View
          ref={nameRef}
          style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 8, gap: 6 }}
        >
          <Text
            style={{
              color: themeStyle.colors.white,
              fontSize: themeStyle.fontSize.description,
              fontFamily: themeStyle.fontFamily.semibold,
            }}
          >
            {name}
          </Text>

          {/* Info / rules popover toggle */}
          <Pressable onPress={() => setShowRules((s) => !s)} style={{ alignSelf: 'flex-end', marginRight: 16 }}>
            <Text style={{ color: 'white', fontWeight: '700' }}>ⓘ</Text>
          </Pressable>

          {errorPlacement === 'above' && <ErrorText />}

          <AnchoredPopover
            isOpen={showRules}
            onClose={() => setShowRules(false)}
            anchorRef={nameRef}
            placement="top"
            align="center"
            offset={0}
          >
            {ruleData && (
              <RulesCard
                title={ruleData.title}
                description={ruleData.description}
                rules={ruleData.rules}
              />
            )}
          </AnchoredPopover>
        </View>

        {errorPlacement === 'topRight' && <ErrorText />}
      </View>

      <View
        style={{
          width,
          height,
          borderRadius,
          paddingHorizontal: 10,
          backgroundColor: themeStyle.colors.white,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 2,
          borderColor,
        }}
      >
        <TextInput
          style={{ flex: 1, height: 50, color: themeStyle.colors.black }}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={isPassword && !isPasswordVisible}
          keyboardType={isEmail ? 'email-address' : 'default'}
          autoCapitalize={isEmail ? 'none' : 'sentences'}
          value={localValue}
          onChangeText={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {showEye && (
          <Pressable onPress={() => setIsPasswordVisible((p) => !p)}>
            {isPasswordVisible ? <EyeOff size={26} color="grey" /> : <Eye size={26} color="grey" />}
          </Pressable>
        )}
      </View>

      {/* Confirm password match */}
      {isConfirm && localValue.length > 0 && (
        <Text
          style={{
            marginTop: 6,
            fontWeight: '700',
            color: matched ? themeStyle.colors.success : themeStyle.colors.fail,
          }}
        >
          {matched ? t('textfield.matched') : t('textfield.notMatch')}
        </Text>
      )}
    </View>
  );
};

export default TextFieldPrimary;
