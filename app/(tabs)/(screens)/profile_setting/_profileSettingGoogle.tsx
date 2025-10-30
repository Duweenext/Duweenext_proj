import React, { useEffect, useReducer, useState } from 'react';
import { View, Text, ScrollView, Alert, Platform } from 'react-native';
import { themeStyle } from '../../../../src/theme';
import ButtonPrimary from '@/src/component/Buttons/ButtonPrimary';
import ButtonGoogle from '@/src/component/Buttons/ButtonGoogle';
import { useAuth } from '@/src/auth/context/auth_context';
import { useUser } from '@/src/api/hooks/useUser';
import UsernameRow from './_usernamerow';
import ModalChangeInformation from '@/src/component/Modals/ModalChangeInformation';
import { useAuthentication } from '@/src/api/hooks/useAuth';
import {
    getDeletionCountdown,
} from "./_local";
import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useDeviceStore } from '@/app/(auth)/_local';
import { qc } from '@/src/api/query';
import { useDeleteAccountStore } from '@/src/flows/_deletelocal';
import PullToRefreshScreen from '@/src/component/Screens/PullToRefresh';
import { t } from 'i18next';

type DeletionBanner = 'idle' | 'locked' | 'pending';


const ProfileSettingGoogle: React.FC = () => {
    const [deletionBanner, setDeletionBanner] = useState<DeletionBanner>('idle');
    const [code, setCode] = useState('');

    const [modal, setModal] = useState<
        "delete-account-verify-code" |
        "confirm-delete-account" |
        "" |
        null>(null);

    const { googleLogin } = useAuthentication();
    const deviceToken = useDeviceStore(state => state.deviceToken);
    const [email, setEmail] = useState('');

    const { logout, login } = useAuth();
    const {
        userData,
        changeUsername,
        sendOTPDeleteAccountGoogle,
        verifyOTPDeleteAccount,
        recoverUser
    } = useUser();

    const { setStep, verificationResponse: verificationResponsePassword, setVerificationResponse } =
        useDeleteAccountStore();

    console.log('User Data:', userData);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '17967520741-mkjuqt3486ft1lhhlv65qp6lujhvot5g.apps.googleusercontent.com',
            iosClientId: '17967520741-5bcdj687vhnv0knbhhtaa0q5a3pph35t.apps.googleusercontent.com',
        });

    }, []);

    async function reAuthenticateGoogle(currentEmail: string): Promise<string> {
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            let userInfo;
            try {
                userInfo = await GoogleSignin.signInSilently();
            } catch (err) {
                userInfo = await GoogleSignin.signIn();
            }

            const idToken = userInfo.data?.idToken;
            const email = userInfo.data?.user.email;

            if (!idToken || !email) {
                throw new Error("Google re-authentication failed: missing token or email");
            }

            if (email.toLowerCase() !== currentEmail.toLowerCase()) {
                throw new Error("Please re-authenticate with the same Google account");
            }

            const googleCredential = GoogleAuthProvider.credential(idToken);
            await signInWithCredential(getAuth(), googleCredential);

            console.log("Re-authentication successful");

            return idToken;
        } catch (err) {
            console.error("Google re-auth error:", err);
            throw err;
        }
    }

    async function deleteAccount () {
        if (!userData) return;
        try {
            const idToken = await reAuthenticateGoogle(userData?.email);
            const response = await sendOTPDeleteAccountGoogle(idToken);
            console.log("Delete account response:", response);
            setModal('delete-account-verify-code');
            setEmail(userData.email);
            if (!response.verification_id) throw new Error("No verification ID in response");
            setVerificationResponse(response);
            setStep('verify-code');
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    }

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

    const onRecovery = async () => {
        await recoverUser();
    }
    const countdown = userData?.permanent_deletion_at ? getDeletionCountdown(userData.permanent_deletion_at) : null;

    const renderDeleteAction = () => {
        if (countdown) {
            return (
                <>
                    <ButtonPrimary
                        text={t("Recovery")}
                        filledColor={themeStyle.colors.white}
                        textColor={themeStyle.colors.fail}
                        onPress={async () => {
                            await onRecovery();
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
                        {t("Your account will be delete within")} {countdown.remainingDays} {t("days")} {countdown.remainingHours} {t("hours")}
                    </Text>
                </>
            );
        }

        return (
            <>
                <ButtonPrimary
                    text={t("Delete Account")}
                    filledColor={themeStyle.colors.white}
                    textColor={themeStyle.colors.fail}
                    onPress={() => {
                        deleteAccount();
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
                        {t('You are unable to perform delete account for 24 hours')}
                    </Text>
                )}
            </>
        );
    };

    const onSaveUsername = async (newName: string) => {
        await changeUsername(newName);
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
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }} key={refreshKey}>

                <Text style={{ fontFamily: themeStyle.fontFamily.bold, fontSize: themeStyle.fontSize.header1, color: themeStyle.colors.white, paddingBottom: 20, left: 20, }}>
                    {t('Profile Information')}
                </Text>

                <UsernameRow
                    username={userData?.user_name || ''}
                    themeStyle={themeStyle}
                    onSaveUsername={onSaveUsername}
                />

                <Text style={{ fontFamily: themeStyle.fontFamily.bold, fontSize: themeStyle.fontSize.header1, color: themeStyle.colors.white, paddingBottom: 10, left: 20 }}>
                    {t('Google Account')}
                </Text>
                <View style={{ flexDirection: 'column', alignSelf: 'center', width: '85%', backgroundColor: themeStyle.colors.white, borderRadius: 10, padding: 15, marginBottom: 25 }}>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 10, marginBottom: 15 }}>
                        <Text style={{ fontFamily: themeStyle.fontFamily.semibold, fontSize: themeStyle.fontSize.description }}>{(t('Account'))}:</Text>
                        <Text style={{ fontFamily: themeStyle.fontFamily.regular, fontSize: themeStyle.fontSize.description }}>{userData?.email}</Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 15, left: 20 }}>
                    <Text style={{ fontFamily: themeStyle.fontFamily.bold, fontSize: themeStyle.fontSize.header1, color: themeStyle.colors.white, paddingBottom: 10 }}>
                        {t('Manage Account')}
                    </Text>
                </View>
                <View style={{ marginTop: 5, marginBottom: 12, flexDirection: 'column', justifyContent: 'flex-start', width: 240, paddingBottom: 20, left: 30 }}>
                    <ButtonGoogle text={t("Google")} borderColor={themeStyle.colors.primary} onPress={() => onGoogleButtonPress()} width={220} />
                    <ButtonPrimary text={t("Logout")} filledColor={themeStyle.colors.white} textColor={themeStyle.colors.black} onPress={() => logout()} />

                    {renderDeleteAction()}
                </View>

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
        </>
    );
};

export default ProfileSettingGoogle;
