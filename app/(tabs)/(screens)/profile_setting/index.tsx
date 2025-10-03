import React, { useEffect, useReducer, useState } from 'react';
import ProfileSettingEmail from './_profileSettingEmail';
import { useAuth } from '@/src/auth/context/auth_context';
import LoadingSpinner from '@/src/component/Others/LoadingIndicator';
import ProfileSettingGoogle from './_profileSettingGoogle';

const ProfileSetting: React.FC = () => {

  const { user } = useAuth();

  if (!user) return null;

  switch (user.accType) {
    case "google":
      return <ProfileSettingGoogle />;
    case "local":
      return <ProfileSettingEmail />;
    default:
      return <LoadingSpinner message='Loading User data' />;
  }
};

export default ProfileSetting;
