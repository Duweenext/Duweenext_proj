import React from 'react';
import { View, Text, ScrollView } from 'react-native';
// ---- reuse your components ----
import TextFieldPrimary from '@/component-v2/TextFields/TextFieldPrimary';
import ButtonPrimary from '@/component-v2/Buttons/ButtonPrimary';
import ButtonModalL from '@/component-v2/Buttons/ButtonModalL';
import ButtonGoogle from '@/component-v2/Buttons/ButtonGoogle';
import ButtonUnderline from '@/component-v2/Buttons/ButtonUnderline';
import ModalChangeInformation from '@/component-v2/Modals/ModalChangeInformation';

import { themeStyle } from '../../src/theme';

type Props = {
  title: string;
  subtitle?: string;
};

const profile_setting: React.FC<Props> = ({ title }) => {
  // demo user data — replace with your store/context
  const [username, setUsername] = React.useState('Jo Mama');
  const [email, setEmail] = React.useState('Kingkonbazuna1@gmail.com');

  // change password state
  const [oldPw, setOldPw] = React.useState('');
  const [newPw, setNewPw] = React.useState('');
  const [confirmPw, setConfirmPw] = React.useState('');

  // modal controls
  const [modalVisible, setModalVisible] = React.useState(false);
  const [verifyPassword, setVerifyPassword] = React.useState('');
  const [verifyError, setVerifyError] = React.useState<string | undefined>();

  const onEditInfo = () => {
    setVerifyPassword('');
    setVerifyError(undefined);
    setModalVisible(true);
  };
  console.log(themeStyle.fontFamily.bold);

  const onConfirmChangePassword = () => {
    // TODO: validation + API call
    if (!oldPw || !newPw || newPw !== confirmPw) {
      // add your error UI if you like
      return;
    }
    console.log('Change password ->', { oldPw, newPw });
  };

  const handleVerifyNext = () => {
    // Example: simple validation
    if (!verifyPassword) {
      setVerifyError('Password required');
      return;
    }
    setVerifyError(undefined);
    setModalVisible(false);
    // Navigate to “edit info” form or open another modal if you want
    console.log('Verified. Proceed to edit information…');
  };

  const onSendAgain = () => {
    console.log('Resend verification…');
  };

  const onLogout = () => {
    console.log('Logout');
  };

  const onDeleteAccount = () => {
    console.log('Delete account');
  };
  

  return (
  <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 16,
      }}
  >
      {/* ---- Change Account Information ---- */}
      <Text style={{
        fontFamily: themeStyle.fontFamily.bold,
        fontSize: themeStyle.fontSize.header1,
        color: themeStyle.colors.white,
        paddingBottom: 10,
      }}>
        Change Account Information
      </Text>
      <View style={{
            maxWidth: 325,
            backgroundColor: themeStyle.colors.white,
            borderRadius: 10,
            padding: 15,
            marginBottom: 20,
            left: 15,
        }}
      >
          <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 15,
          }}
          >
                  <Text style={{
                    fontFamily: themeStyle.fontFamily.semibold, 
                    fontSize: themeStyle.fontSize.description,
                  }}>
                    Username:
                  </Text>
                  <Text style={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '70%',
                  }}>
                    {username}
                  </Text>
          </View>

          <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingBottom: 15,
          }}>
                <Text style={{
                  fontFamily: themeStyle.fontFamily.semibold, 
                    fontSize: themeStyle.fontSize.description,
                    }}>
                      Email: 
                </Text>
                <Text style={{
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  width: '70%',

                }}>
                  {email}
                </Text>
          </View>

        <View  style={{
          
          width: '100%',             // match card width
          alignItems: 'flex-end',    // push child to right
          right: 10,                 // distance from right edge of card
        }}>
          <ButtonModalL
          text="Edit Information"
          filledColor={themeStyle.colors.primary}
          textColor={themeStyle.colors.white}
          onPress={onEditInfo}
        />
        </View>
      </View>

      {/* ---- Change Password ---- */}
      <View style={{
        flexDirection: 'column', 
      }}>
        <Text style={{
        fontFamily: themeStyle.fontFamily.bold,
        fontSize: themeStyle.fontSize.header1,
        color: themeStyle.colors.white,
        paddingBottom: 10,
      }}>
        Change Password
      </Text>

        <View>
          <TextFieldPrimary
            name="Enter old password"
            type="password"
            passwordVariant="old"
            placeholder="••••••••••••"
            value={oldPw}
            onChangeText={setOldPw}
          />
        </View>

        <View>
          <TextFieldPrimary
             name="Enter new password"
            type="password"
            passwordVariant="default"
            placeholder="••••••••••••"
            value={newPw}
            onChangeText={setNewPw}   
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
            onChangeText={setConfirmPw}       
          />
       </View>
       <View 
       style={{
        marginTop: -5,
        left: 20,
       }}>
        <ButtonUnderline text="Forgot password" onPress={() => console.log('Forgot password')} />
        </View>
    
        <View style={{ 
          marginTop: 12,
          alignItems: 'flex-start',    // push child to right
          left: 128,
          }}>
          <ButtonPrimary
            text="Change password"
            filledColor= {themeStyle.colors.primary}
            borderColor={themeStyle.colors.white}
            textColor={themeStyle.colors.white}
            onPress={onConfirmChangePassword}
          />
        
        </View>
      </View>

      {/* ---- Linked Accounts ---- */}
      <View style={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginTop: 15,
      }}>
        <Text style={{fontFamily: themeStyle.fontFamily.bold,
        fontSize: themeStyle.fontSize.header1,
        color: themeStyle.colors.white,
        paddingBottom: 10,}}>Linked Accounts</Text>
      </View>
      <View style={{ 
        marginTop: 5,
        marginBottom: 12,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: 240,
        paddingBottom: 20,
        left: 10,
      }}>
        
        <ButtonGoogle
            text="Google"
            borderColor={themeStyle.colors.primary}
            onPress={() => console.log('Google link')}
            width={220}
        />

        <ButtonPrimary
            text="Logout"
            filledColor= {themeStyle.colors.white}
            textColor={themeStyle.colors.black}
            onPress={onLogout}
        />
        <ButtonPrimary
          text="Delete Account"
          filledColor={themeStyle.colors.white}
          textColor={themeStyle.colors.fail}
          onPress={onDeleteAccount}
        />
       </View>
      {/* ---- Verify Modal (reused template) ---- */}
      <ModalChangeInformation
        visible={modalVisible}
        title="Change email"
        titleColor={themeStyle.colors.fail}
        descriptionText="To perform email change please verify yourself. Your current email is"
        instructionText="Enter password below"
        email={email} // we added support for dynamic email previously
        errorMessage={verifyError}
        fields={[
          {
            type: 'password',
            placeholder: 'Enter your password',
            value: verifyPassword,
            onChangeText: setVerifyPassword,
          },
        ]}
        button={{
          text: 'Next',
          onPress: handleVerifyNext,
          filledColor: '#000000',
          textColor: '#FFFFFF',
        }}
        underlineButton={{
          text: 'Send again',
          onPress: onSendAgain,
        }}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  );
};

export default profile_setting;
