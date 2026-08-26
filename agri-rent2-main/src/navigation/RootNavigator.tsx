import React from 'react';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import AdminStack from './AdminStack';
import SplashScreen from '../screens/SplashScreen';
import useAppSelector from '../hooks/useAppSelector';

export default function RootNavigator() {
  const { token, user, bootstrapped } = useAppSelector((state) => state.auth);

  if (!bootstrapped) {
    return <SplashScreen />;
  }

  if (!token) {
    return <AuthStack />;
  }

  if (user?.role === 'admin') {
    return <AdminStack />;
  }

  return <MainStack />;
}
