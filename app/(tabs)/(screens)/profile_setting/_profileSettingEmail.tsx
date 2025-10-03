import React, { useEffect, useReducer, useState } from 'react';
import { View, Text, ScrollView, Alert, Platform } from 'react-native';
import ForgotPasswordFlow from '../../../../src/flows/ForgotPasswordFlow';
import { themeStyle } from '../../../../src/theme';
import ButtonPrimary from '@/src/component/Buttons/ButtonPrimary';
import TextFieldPrimary from '@/src/component/TextFields/TextFieldPrimary';
import ButtonModalL from '@/src/component/Buttons/ButtonModalL';
import ButtonUnderline from '@/src/component/Buttons/ButtonUnderline';
import ButtonGoogle from '@/src/component/Buttons/ButtonGoogle';
import { useAuth } from '@/src/auth/context/auth_context';
import { useUser } from '@/src/api/hooks/useUser';
import UsernameRow from './_usernamerow';
import ModalChangeInformation from '@/src/component/Modals/ModalChangeInformation';
import { useAuthentication } from '@/src/api/hooks/useAuth';
import z from 'zod';
import PasswordStrengthMeter, { usePasswordStrength } from '@/src/component/TextFields/PasswordStrength/PasswordStrength';
import { passwordRules } from '@/src/component/TextFields/PasswordStrength/rule';
import {
  useEmailChangeStore,
  useEmailChangeAutoExpire,
  useCountdown,
  formatMMSS,
  getDeletionCountdown,
} from "./_local";
import { Pressable } from "react-native";
import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useDeviceStore } from '@/app/(auth)/_local';
import { qc } from '@/src/api/query';
import { useDeleteAccountStore } from '@/src/flows/_deletelocal';
import { Icon } from 'react-native-paper';
import PullToRefreshScreen from '@/src/component/Screens/PullToRefresh';

type DeletionBanner = 'idle' | 'locked' | 'pending';

const emailSchema = z.string().trim().min(1, "Required").email("Invalid email");

const resetPasswordSchema = z.object({
  oldPassword: z.string().min(6, " must be at least 6 characters").nonempty("Required"),
  newPassword: z.string().min(8, " must be at least 8 characters").nonempty("Required"),
  confirmPassword: z.string().nonempty("Required"),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  }
);

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

const ProfileSettingEmail: React.FC = () => {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [verifyPw, setVerifyPw] = useState('');

  const [oldPwError, setOldPwError] = useState<string | undefined>();
  const [newPwError, setNewPwError] = useState<string | undefined>();
  const [confirmPwError, setConfirmPwError] = useState<string | undefined>();

  const [deletionBanner, setDeletionBanner] = useState<DeletionBanner>('idle');

  const [verifyPasswordInput, setVerifyPasswordInput] = useState('');
  const [verifyError, setVerifyError] = useState<string | undefined>();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();
  const [editEmail, setEditEmail] = useState('');
  const [editError, setEditError] = useState<string | undefined>();
  const [challengeToken, setChallengeToken] = useState<string | null>(null);

  const [modal, setModal] = useState<
    "change-email-verify-password" |
    "verify-code-old-email" |
    "change-email" |
    "forgot-password" |
    "verify-code-new-email" |
    "reset-password" |
    "delete-account-verify-password" |
    "delete-account-verify-code" |
    "confirm-delete-account" |
    "" |
    null>(null);
  const saveStep = useEmailChangeStore((s) => s.saveStep);
  const clearPersist = useEmailChangeStore((s) => s.clear);
  const step = useEmailChangeStore(s => s.step);
  const verificationResponseEmail = useEmailChangeStore(s => s.verificationResponse);
  const expiresAt = useEmailChangeStore(s => s.expiresAt);
  useEmailChangeAutoExpire();
  const remainingMs = useCountdown(expiresAt);

  const onResume = () => {
    if (!step) return;
    setModal(step as any);
  };
  const showResume = !!step && remainingMs > 0;
  const { googleLogin } = useAuthentication();
  const deviceToken = useDeviceStore(state => state.deviceToken);
  const [email, setEmail] = useState('');
  const { strength, color, percent } = usePasswordStrength(newPw);

  const { logout, login, user } = useAuth();
  const {
    userData,
    changeUsername,
    verifyPassword,
    sendOtpOldEmail,
    verifyOldOtpCode,
    verifyNewOtpCode,
    sendOtpNewEmail,
    resetPassword,
    sendOTPDeleteAccount,
    verifyOTPDeleteAccount,
    recoverUser
  } = useUser();

  const { setStep, verificationResponse: verificationResponsePassword, setVerificationResponse } =
    useDeleteAccountStore();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '17967520741-mkjuqt3486ft1lhhlv65qp6lujhvot5g.apps.googleusercontent.com',
      iosClientId: '17967520741-5bcdj687vhnv0knbhhtaa0q5a3pph35t.apps.googleusercontent.com',
    });

  }, []);

  

  async function onGoogleButtonPress() {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    await GoogleSignin.signOut();

    const signInResult = await GoogleSignin.signIn().then((user) => {
      return user;
    }).catch((error) => {
      console.error('Google Sign-In error:', error);
      throw error;
    });

    const idToken = signInResult.data?.idToken;
    if (!idToken) {
      throw new Error('No ID token found');
    }

    const googleCredential = GoogleAuthProvider.credential(idToken);

    const res = await googleLogin({
      id_token: idToken,
      device_token: deviceToken,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    });
    await login(res.token);
    qc.removeQueries({ queryKey: ['user'] });
    await qc.refetchQueries({ queryKey: ['user'] });
    setRefreshKey(prev => prev + 1);

    return signInWithCredential(getAuth(), googleCredential);
  }

  const onEditInfo = () => {
    setVerifyPasswordInput('');
    setVerifyError(undefined);
    setModal('change-email-verify-password');
  };

  const onValidatePassword = (data: ResetPasswordInput) => {
    const result = resetPasswordSchema.safeParse(data);
    if (!result.success) {
      result.error.errors.forEach((err) => {
        switch (err.path[0]) {
          case "oldPassword":
            setOldPwError(err.message);
            break;
          case "newPassword":
            setNewPwError(err.message);
            break;
          case "confirmPassword":
            setConfirmPwError(err.message);
            break;
        }
      });
      return false;
    }
    return result.success;
  }

  const onConfirmChangePassword = async () => {
    setOldPwError(undefined);
    setNewPwError(undefined);
    setConfirmPwError(undefined);

    const isValid = onValidatePassword({ oldPassword: oldPw, newPassword: newPw, confirmPassword: confirmPw });
    if (!isValid) return;

    await resetPassword(oldPw, newPw).then((res) => {
      setOldPw('');
      setNewPw('');
      setConfirmPw('');
      setRefreshKey(prev => prev + 1);
    }).catch((error) => {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password. Please try again.');
    });
  };

  const onRecovery = async () => {
        await recoverUser();
    }

  const handleVerifyPassword = async () => {
    setVerifyError(undefined);
    await verifyPassword(verifyPasswordInput).then(async (isValid) => {
      if (isValid) {
        setModal('verify-code-old-email');
        setVerifyPasswordInput('');
        const data = await sendOtpOldEmail();
        saveStep({
          step: "verify-code-old-email",
          verificationResponse: data,
        });
      } else {
        setVerifyError('Incorrect password');
      }
    });
  };

  const handleConfirmCodeOldEmail = async () => {
    setCodeError(undefined);
    if (!code) { setCodeError('Required'); return; }
    if (!verificationResponseEmail) { setCodeError('No verification in progress'); return; }

    await verifyOldOtpCode({ verification_id: verificationResponseEmail.verification_id, code }).then((res) => {
      console.log('Old email verified successfully');
      setChallengeToken(res.token);
      setCode('');
      setModal('change-email');
      saveStep({
        step: "change-email",
        challengeToken: res.token,
      });
    }).catch((error) => {
      console.error('Error verifying old email:', error);
    });
  };

  const handleSubmitEmailChange = async () => {
    if (!editEmail) { setEditError('Required'); return; }

    const result = emailSchema.safeParse(editEmail);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      if (fieldErrors[0]) setEditError(fieldErrors[0].toString());
      return;
    }

    if (!verificationResponseEmail) { setEditError('No verification in progress'); return; }
    if (!challengeToken) { setEditError('No challenge token, please verify old email again'); return; }

    await sendOtpNewEmail(editEmail, challengeToken).then((data) => {
      setModal('verify-code-new-email');
      setEditError(undefined);
      console.log('New email OTP sent, please verify');
      saveStep({
        step: "verify-code-new-email",
        challengeToken,
        newEmail: editEmail,
        verificationResponse: data,
      });
    });

  }

  const handleConfirmCodeNewEmail = async () => {
    setCodeError(undefined);
    if (!editEmail) { setEditError('Required'); return; }
    if (!code) { setCodeError('Required'); return; }
    if (!verificationResponseEmail) { setCodeError('No verification in progress'); return; }
    if (!challengeToken) { setEditError('No challenge token, please verify old email again'); return; }

    await verifyNewOtpCode({ verification_id: verificationResponseEmail.verification_id, code, email: editEmail }, challengeToken).then(() => {
      if (editEmail) setEmail(editEmail);
      setCode('');
      setModal(null);
      clearPersist();
      logout();
      Alert.alert('Email changed', 'Your email address has been updated.');
    }).catch((error) => {
      console.error('Error verifying new email:', error);
    });
  }

  const countdown = userData?.permanent_deletion_at ? getDeletionCountdown(userData.permanent_deletion_at) : null;

  const renderDeleteAction = () => {
    if (countdown) {
      return (
        <>
          <ButtonPrimary
            text="Recovery"
            filledColor={themeStyle.colors.white}
            textColor={themeStyle.colors.fail}
            onPress={() => {
              onRecovery();
            }}
          />
          <Text
            style={{
              marginTop: 10,
              color: themeStyle.colors.warning,
              fontFamily: themeStyle.fontFamily.medium,
              fontSize: themeStyle.fontSize.description,
            }}
          >
            Your account will be delete within             {countdown.remainingDays} days {countdown.remainingHours} hours
          </Text>
        </>
      );
    }

    return (
      <>
        <ButtonPrimary
          text="Delete Account"
          filledColor={themeStyle.colors.white}
          textColor={themeStyle.colors.fail}
          onPress={() => {
            setModal('delete-account-verify-password');
          }}
        />
        {deletionBanner === 'locked' && (
          <Text
            style={{
              marginTop: 10,
              color: themeStyle.colors.warning,
              fontFamily: themeStyle.fontFamily.medium,
              fontSize: themeStyle.fontSize.description,
            }}
          >
            You are unable to perform delete account for 24 hours
          </Text>
        )}
      </>
    );
  };

  const onSaveUsername = async (newName: string) => {
    await changeUsername(newName);
  };

  const onVerifyPassword = async (password: string) => {
    await verifyPassword(password);
    const resp = await sendOTPDeleteAccount?.();
    if (!resp) return;
    setVerificationResponse(resp);
    setStep("verify-code");
    setModal('delete-account-verify-code');
  };

  const verifyCodeDeleteAccount = async (code: string) => {
    if (!verificationResponsePassword) return;
    await verifyOTPDeleteAccount?.({
      verification_id: verificationResponsePassword.verification_id,
      code,
      email,
    });
    setModal('confirm-delete-account');
  }

  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <PullToRefreshScreen>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }} key={refreshKey}>
        <Text style={{ fontFamily: themeStyle.fontFamily.bold, fontSize: themeStyle.fontSize.header1, color: themeStyle.colors.white, paddingBottom: 20, left: 20, }}>
          Profile Information
        </Text>

        <UsernameRow
          username={userData?.user_name || ''}
          themeStyle={themeStyle}
          onSaveUsername={onSaveUsername}
        />

        <Text style={{ fontFamily: themeStyle.fontFamily.bold, fontSize: themeStyle.fontSize.header1, color: themeStyle.colors.white, paddingBottom: 10, left: 20 }}>
          Email Address
        </Text>
        <View style={{ flexDirection: 'column', alignSelf: 'center', width: '85%', backgroundColor: themeStyle.colors.white, borderRadius: 10, padding: 15, marginBottom: 25 }}>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 10, marginBottom: 15 }}>
            <Text style={{ fontFamily: themeStyle.fontFamily.semibold, fontSize: themeStyle.fontSize.description }}>Email:</Text>
            <Text style={{ fontFamily: themeStyle.fontFamily.regular, fontSize: themeStyle.fontSize.description }}>{userData?.email}</Text>
          </View>

          <View style={{ width: '100%', alignItems: 'flex-start' }}>
            <ButtonModalL
              text="Edit Information"
              filledColor={themeStyle.colors.primary}
              textColor={themeStyle.colors.white}
              onPress={onEditInfo}
              size="L"
              borderRadius={8}
            />

            {showResume && (
              <Pressable
                onPress={onResume}
                style={{
                  alignSelf: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: themeStyle.colors.fail,
                  borderRadius: 8,
                  backgroundColor: 'transparent',
                  marginVertical: 8,
                }}
              >
                <Text style={{ color: themeStyle.colors.fail, fontFamily: themeStyle.fontFamily.semibold }}>
                  Resume: {step === "verify-code-old-email" ? "Verify code (old email)"
                    : step === "change-email" ? "Enter new email"
                      : "Verify code (new email)"} ({formatMMSS(remainingMs)})
                </Text>
              </Pressable>
            )}

          </View>
        </View>

        <ModalChangeInformation
          visible={modal === 'change-email-verify-password'}
          title="Change email"
          titleColor={themeStyle.colors.fail}
          descriptionText="To perform email change please verify yourself. Your current email is"
          instructionText="Enter password below"
          email={email}
          errorMessage={verifyError}
          fields={[
            {
              type: 'password',
              mode: 'password-old',
              placeholder: 'Enter your password',
              value: verifyPasswordInput,
              onChangeText: setVerifyPasswordInput,
            },
          ]}
          underlineButton={{
            text: 'Forgot password',
            onPress: () => {
              setModal(null);
              setModal('forgot-password');
            },
          }}
          button={{
            text: 'Next',
            onPress: handleVerifyPassword,
            filledColor: themeStyle.colors.primary,
            textColor: themeStyle.colors.white,
          }}
          onClose={() => { setModal(null); }}
        />


        <ModalChangeInformation
          visible={modal === 'verify-code-old-email'}
          title="Change email"
          titleColor={themeStyle.colors.fail}
          descriptionText="The verification code has been sent to"
          email={email}
          errorMessage={codeError}
          fields={[{ type: 'code', placeholder: '', value: code, onChangeText: setCode }]}
          underlineButton={{ text: 'Send again', onPress: () => console.log('Resend verification code…') }}
          button={{
            text: 'Confirm',
            onPress: handleConfirmCodeOldEmail,
            filledColor: themeStyle.colors.primary,
            textColor: themeStyle.colors.white,
          }}
          onClose={() => { setModal(null); }}
        />

        <ModalChangeInformation
          visible={modal === 'change-email'}
          title="Change email"
          titleColor={themeStyle.colors.fail}
          descriptionText="Please put your new email information below"
          errorMessage={editError}
          fields={[
            {
              type: 'text',
              mode: 'text',
              inputKind: 'email',
              name: 'New Email',
              placeholder: 'your@email.com',
              value: editEmail,
              onChangeText: setEditEmail,
            },
          ]}
          button={{
            text: 'Submit',
            onPress: handleSubmitEmailChange,
            filledColor: themeStyle.colors.primary,
            textColor: themeStyle.colors.white,
          }}
          onClose={() => { setModal(null); }}
        />

        <ModalChangeInformation
          visible={modal === 'verify-code-new-email'}
          title="Change email"
          titleColor={themeStyle.colors.fail}
          descriptionText="The verification code has been sent to"
          email={editEmail}
          errorMessage={codeError}
          fields={[{ type: 'code', placeholder: '', value: code, onChangeText: setCode }]}
          underlineButton={{ text: 'Send again', onPress: () => console.log('Resend verification code…') }}
          button={{
            text: 'Confirm',
            onPress: handleConfirmCodeNewEmail,
            filledColor: themeStyle.colors.primary,
            textColor: themeStyle.colors.white,
          }}
          onClose={() => { setModal(null); }}
        />

        {/* ---- Change Password (user knows old) ---- */}
        <Text style={{ fontFamily: themeStyle.fontFamily.bold, fontSize: themeStyle.fontSize.header1, color: themeStyle.colors.white, paddingBottom: 10, left: 20 }}>
          Password
        </Text>
        <View style={{ flexDirection: 'column', alignItems: 'center' }}>


          <View>
            <TextFieldPrimary
              name="Enter old password"
              type="password"
              passwordVariant="old"
              placeholder="••••••••••••"
              value={oldPw}
              onChangeText={(t) => { setOldPw(t); setOldPwError(undefined); }}
              errorPlacement="topRight"
              externalError={oldPwError}
              ruleData={{
                title: "Old Password",
                description: "Enter your current password.",
                rules: [
                  "Must match your current password",
                ],
              }}
            />
          </View>

          <View>
            <TextFieldPrimary
              name="Enter new password"
              type="password"
              passwordVariant="default"
              placeholder="••••••••••••"
              value={newPw}
              onChangeText={(t) => { setNewPw(t); setNewPwError(undefined); }}
              errorPlacement="topRight"
              externalError={newPwError}
              ruleData={passwordRules}
            />
          </View>

          {newPw && <PasswordStrengthMeter
            strength={strength}
            color={color}
            percent={percent}
          />}

          <View>
            <TextFieldPrimary
              name="Confirm new password"
              type="password"
              passwordVariant="confirm"
              confirmWith={newPw}
              placeholder="••••••••••••"
              value={confirmPw}
              onChangeText={(t) => { setConfirmPw(t); setConfirmPwError(undefined); }}
              errorPlacement="topRight"
              externalError={confirmPwError}
              ruleData={{
                title: "Confirm Password",
                description: "Re-enter your new password to confirm.",
                rules: [
                  "Must match the new password entered above",
                ],
              }}
            />
          </View>

          <View style={{ marginTop: -5, left: -100 }}>
            <ButtonUnderline text="Forgot password"
              onPress={() => {
                setModal('forgot-password');
              }} />
          </View>

          <View style={{ marginTop: 12, alignItems: 'flex-end', right: -70 }}>
            <ButtonPrimary
              text="Change password"
              filledColor={themeStyle.colors.primary}
              borderColor={themeStyle.colors.white}
              textColor={themeStyle.colors.white}
              onPress={onConfirmChangePassword}
            />
          </View>
        </View>

        {/* ---- Linked Accounts ---- */}
        <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 15, left: 20 }}>
          <Text style={{ fontFamily: themeStyle.fontFamily.bold, fontSize: themeStyle.fontSize.header1, color: themeStyle.colors.white, paddingBottom: 10 }}>
            Linked Accounts
          </Text>
        </View>
        <View style={{ marginTop: 5, marginBottom: 12, flexDirection: 'column', justifyContent: 'flex-start', width: 240, paddingBottom: 20, left: 30 }}>
          <ButtonGoogle text="Google" borderColor={themeStyle.colors.primary} onPress={() => onGoogleButtonPress()} width={220} />
          <ButtonPrimary text="Logout" filledColor={themeStyle.colors.white} textColor={themeStyle.colors.black} onPress={() => logout()} />

          {/* Danger zone / Recovery UI */}
          {renderDeleteAction()}
        </View>

        <ForgotPasswordFlow
          visible={modal === 'forgot-password'}
          onClose={() => setModal(null)}
          initialEmail={email}
          startStep="verify"
        />

        <ModalChangeInformation
          visible={modal === 'delete-account-verify-password'}
          title="Delete account"
          titleIcon={<Icon size={40} source={require('@/assets/icons/delete.png') } />}
          titleColor={themeStyle.colors.fail}
          instructionText="Enter password below"
          email={email}
          fields={[
            {
              type: 'password',
              mode: 'password-old',
              placeholder: 'Enter your password',
              value: verifyPw,
              onChangeText: setVerifyPw,
            },
          ]}
          button={{
            text: 'Next',
            onPress: () => onVerifyPassword(verifyPw),
            filledColor: themeStyle.colors.primary,
            textColor: themeStyle.colors.white,
          }}
          onClose={() => { setModal(null); }}
        />

        <ModalChangeInformation
          visible={modal === 'delete-account-verify-code'}
          title="Delete account"
          titleColor={themeStyle.colors.fail}
          descriptionText="The verification code has been sent to"
          email={email}
          fields={[{ type: 'code', placeholder: '', value: code, onChangeText: setCode }]}
          underlineButton={{ text: 'Send again', onPress: () => console.log('Resend verification code…') }}
          button={{
            text: 'Confirm',
            onPress: () => verifyCodeDeleteAccount(code),
            filledColor: themeStyle.colors.primary,
            textColor: themeStyle.colors.white,
          }}
          onClose={() => { setModal(null); }}
        />
      </ScrollView>
        </PullToRefreshScreen>
    </>
  );
};

export default ProfileSettingEmail;
