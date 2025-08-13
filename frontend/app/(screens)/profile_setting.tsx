import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import TextFieldPrimary from '@/component-v2/TextFields/TextFieldPrimary';
import ButtonPrimary from '@/component-v2/Buttons/ButtonPrimary';
import ButtonModalL from '@/component-v2/Buttons/ButtonModalL';
import ButtonGoogle from '@/component-v2/Buttons/ButtonGoogle';
import ButtonUnderline from '@/component-v2/Buttons/ButtonUnderline';
import ModalChangeInformation from '@/component-v2/Modals/ModalChangeInformation';
import ForgotPasswordFlow from '../../src/flows/ForgotPasswordFlow';
import DeleteAccountFlow from '../../src/flows/DeleteAccountFlow';
import { themeStyle } from '../../src/theme';

const TAKEN_USERNAMES = new Set(['admin', 'jane', 'john', 'taken_user']);
const TAKEN_EMAILS = new Set(['taken@example.com', 'exists@gmail.com']);

// temp current password for demo paths (remember-old, delete flow password)
const TEMP_CURRENT_PASSWORD = 'Test@1234';

type Props = { title: string; subtitle?: string };
type Step = 'verifyPassword' | 'verifyCode' | 'editProfile' | null;
type DeletionBanner = 'idle' | 'locked' | 'pending';

const ProfileSetting: React.FC<Props> = () => {
  const [username, setUsername] = React.useState('Jo Mama');
  const [email, setEmail] = React.useState('Kingkonbazuna1@gmail.com');

  // change password (user remembers old)
  const [oldPw, setOldPw] = React.useState('');
  const [newPw, setNewPw] = React.useState('');
  const [confirmPw, setConfirmPw] = React.useState('');

  const [oldPwError, setOldPwError] = React.useState<string | undefined>();
  const [newPwError, setNewPwError] = React.useState<string | undefined>();
  const [confirmPwError, setConfirmPwError] = React.useState<string | undefined>();

  // edit information flow
  const [modalVisible, setModalVisible] = React.useState(false);
  const [step, setStep] = React.useState<Step>(null);

  // shared flows
  const [forgotOpen, setForgotOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  // bottom delete/recovery banner state
  const [deletionBanner, setDeletionBanner] = React.useState<DeletionBanner>('idle');

  // verify/change info modal state
  const [verifyPassword, setVerifyPassword] = React.useState('');
  const [verifyError, setVerifyError] = React.useState<string | undefined>();
  const [code, setCode] = React.useState('');
  const [codeError, setCodeError] = React.useState<string | undefined>();
  const [editName, setEditName] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [editError, setEditError] = React.useState<string | undefined>();

  const onEditInfo = () => {
    setVerifyPassword('');
    setVerifyError(undefined);
    setStep('verifyPassword');
    setModalVisible(true);
  };

  // password policy helper
  const isStrongEnough = (pwd: string) => {
    const lenOK = pwd.length >= 8;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNum   = /\d/.test(pwd);
    const hasSym   = /[^A-Za-z0-9]/.test(pwd);
    const score = [hasLower, hasUpper, hasNum, hasSym].filter(Boolean).length;
    return lenOK && score >= 3;
  };

  // submit change password (remembers old)
  const onConfirmChangePassword = () => {
    setOldPwError(undefined); setNewPwError(undefined); setConfirmPwError(undefined);

    if (!oldPw) setOldPwError('Required');
    if (!newPw) setNewPwError('Required');
    if (!confirmPw) setConfirmPwError('Required');
    if (!oldPw || !newPw || !confirmPw) return;

    if (oldPw !== TEMP_CURRENT_PASSWORD) { setOldPwError('Incorrect password'); return; }
    if (newPw === oldPw) { setNewPwError('New password must be different from old password'); return; }
    if (!isStrongEnough(newPw)) { setNewPwError('Password too weak (min 8, use 3 of upper/lower/number/symbol).'); return; }
    if (newPw !== confirmPw) { setConfirmPwError('Passwords do not match'); return; }

    console.log('Change password ->', { oldPw, newPw });
    setOldPw(''); setNewPw(''); setConfirmPw('');
    Alert.alert('Password changed', 'Your password has been updated.');
  };

  // ====== existing edit info flow ======
  const handleNextFromPassword = () => {
    if (!verifyPassword) { setVerifyError('Password required'); return; }
    setVerifyError(undefined);
    setCode(''); setCodeError(undefined);
    setStep('verifyCode');
  };

  const handleConfirmCode = () => {
    if (!code) { setCodeError('Code required'); return; }
    if (code !== '123456') { setCodeError('Incorrect code'); return; }
    setCodeError(undefined);
    setEditName(username);
    setEditEmail(email);
    setEditError(undefined);
    setStep('editProfile');
  };

  const handleSubmitEditProfile = () => {
    const nameTrim = editName.trim();
    const emailTrim = editEmail.trim().toLowerCase();
    const curEmailTrim = email.trim().toLowerCase();

    if (!nameTrim || !emailTrim) { setEditError('All fields are required'); return; }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);
    if (!emailOk) { setEditError('Invalid email address'); return; }

    const nameChanged = nameTrim.toLowerCase() !== username.trim().toLowerCase();
    const emailChanged = emailTrim !== curEmailTrim;

    if (nameChanged && TAKEN_USERNAMES.has(nameTrim.toLowerCase())) { setEditError('Username already exists'); return; }
    if (emailChanged && TAKEN_EMAILS.has(emailTrim)) { setEditError('Email already exists'); return; }

    setUsername(nameTrim);
    setEmail(editEmail.trim());
    setEditError(undefined);
    setModalVisible(false);
    setStep(null);
    Alert.alert('Profile updated', 'Your profile information has been saved.');
  };

  const renderModal = () => {
    if (!modalVisible || !step) return null;

    if (step === 'verifyPassword') {
      return (
        <ModalChangeInformation
          visible
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
              value: verifyPassword,
              onChangeText: setVerifyPassword,
            },
          ]}
          underlineButton={{
            text: 'Forgot password',
            onPress: () => {
              setModalVisible(false);
              setStep(null);
              setForgotOpen(true);
            },
          }}
          button={{
            text: 'Next',
            onPress: handleNextFromPassword,
            filledColor: themeStyle.colors.primary,
            textColor: themeStyle.colors.white,
          }}
          onClose={() => { setModalVisible(false); setStep(null); }}
        />
      );
    }

    if (step === 'verifyCode') {
      return (
        <ModalChangeInformation
          visible
          title="Change email"
          titleColor={themeStyle.colors.fail}
          descriptionText="The verification code has been sent to"
          email={email}
          errorMessage={codeError}
          fields={[{ type: 'code', placeholder: '', value: code, onChangeText: setCode }]}
          underlineButton={{ text: 'Send again', onPress: () => console.log('Resend verification code…') }}
          button={{
            text: 'Confirm',
            onPress: handleConfirmCode,
            filledColor: themeStyle.colors.primary,
            textColor: themeStyle.colors.white,
          }}
          onClose={() => { setModalVisible(false); setStep(null); }}
        />
      );
    }

    return (
      <ModalChangeInformation
        visible
        title="Edit Profile"
        titleColor={themeStyle.colors.fail}
        descriptionText="To perform password change please enter information below"
        errorMessage={editError}
        fields={[
          {
            type: 'text',
            mode: 'text',
            inputKind: 'letters',
            name: 'New Username',
            placeholder: 'Your new username',
            value: editName,
            onChangeText: setEditName,
          },
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
          onPress: handleSubmitEditProfile,
          filledColor: themeStyle.colors.primary,
          textColor: themeStyle.colors.white,
        }}
        onClose={() => { setModalVisible(false); setStep(null); }}
      />
    );
  };

  // banner helpers
  const renderDeleteAction = () => {
    if (deletionBanner === 'pending') {
      return (
        <>
          <ButtonPrimary
            text="Recovery"
            filledColor={themeStyle.colors.white}
            textColor={themeStyle.colors.fail}
            onPress={() => {
              // dev-only: cancel pending deletion locally
              setDeletionBanner('idle');
              Alert.alert('Recovery requested', 'Your account has been restored.');
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
            Your account will be delete within 7 days
          </Text>
        </>
      );
    }

    // idle or locked → Delete Account button
    return (
      <>
        <ButtonPrimary
          text="Delete Account"
          filledColor={themeStyle.colors.white}
          textColor={themeStyle.colors.fail}
          onPress={() => setDeleteOpen(true)}
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

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
      {/* ---- Change Account Information ---- */}
      <Text style={{ fontFamily: themeStyle.fontFamily.bold, fontSize: themeStyle.fontSize.header1, color: themeStyle.colors.white, paddingBottom: 8 }}>
        Change Account Information
      </Text>

      <View style={{ maxWidth: 325, backgroundColor: themeStyle.colors.white, borderRadius: 10, padding: 15, marginBottom: 15, left: 15 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
          <Text style={{ fontFamily: themeStyle.fontFamily.semibold, fontSize: themeStyle.fontSize.description }}>Username:</Text>
          <Text style={{ width: '70%' }}>{username}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 15 }}>
          <Text style={{ fontFamily: themeStyle.fontFamily.semibold, fontSize: themeStyle.fontSize.description }}>Email:</Text>
          <Text style={{ width: '70%' }}>{email}</Text>
        </View>

        <View style={{ width: '100%', alignItems: 'flex-start', left: 150, marginBottom: -10 }}>
          <ButtonModalL
            text="Edit Information"
            filledColor={themeStyle.colors.primary}
            textColor={themeStyle.colors.white}
            onPress={onEditInfo}
            size="L"
          />
        </View>
      </View>

      {/* ---- Change Password (user knows old) ---- */}
      <View style={{ flexDirection: 'column' }}>
        <Text style={{ fontFamily: themeStyle.fontFamily.bold, fontSize: themeStyle.fontSize.header1, color: themeStyle.colors.white, paddingBottom: 10 }}>
          Change Password
        </Text>

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
          />
        </View>

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
          />
        </View>

        <View style={{ marginTop: -5, left: 20 }}>
          <ButtonUnderline text="Forgot password" onPress={() => setForgotOpen(true)} />
        </View>

        <View style={{ marginTop: 12, alignItems: 'flex-start', left: 128 }}>
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
      <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 15 }}>
        <Text style={{ fontFamily: themeStyle.fontFamily.bold, fontSize: themeStyle.fontSize.header1, color: themeStyle.colors.white, paddingBottom: 10 }}>
          Linked Accounts
        </Text>
      </View>
      <View style={{ marginTop: 5, marginBottom: 12, flexDirection: 'column', justifyContent: 'flex-start', width: 240, paddingBottom: 20, left: 10 }}>
        <ButtonGoogle text="Google" borderColor={themeStyle.colors.primary} onPress={() => console.log('Google link')} width={220} />
        <ButtonPrimary text="Logout" filledColor={themeStyle.colors.white} textColor={themeStyle.colors.black} onPress={() => console.log('Logout')} />

        {/* Danger zone / Recovery UI */}
        {renderDeleteAction()}
      </View>

      {/* Existing edit info modal */}
      {renderModal()}

      {/* Shared Forgot Password flow */}
      <ForgotPasswordFlow
        visible={forgotOpen}
        onClose={() => setForgotOpen(false)}
        initialEmail={email}
        startAtVerify
      />

      {/* Account deletion flow */}
      <DeleteAccountFlow
        visible={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        email={email}
        onForgotPassword={() => {
          setDeleteOpen(false);
          setForgotOpen(true);
        }}
        tempCurrentPassword={TEMP_CURRENT_PASSWORD}
        onFinished={(result) => {
          setDeleteOpen(false);
          if (result === 'completed') setDeletionBanner('pending');
          else if (result === 'locked') setDeletionBanner('locked');
          // 'cancel' → leave as-is
        }}
      />
    </ScrollView>
  );
};

export default ProfileSetting;
