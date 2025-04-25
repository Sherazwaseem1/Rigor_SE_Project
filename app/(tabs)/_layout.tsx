import { Tabs, usePathname, useRouter } from 'expo-router';
import {
  AppState,
  AppStateStatus,
  Keyboard,
  TouchableWithoutFeedback,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import styles from '../../assets/styles/styleLayout';

const SESSION_TIMEOUT = 10 * 60 * 1000; 

const EXCLUDED_ROUTES = ['/', '/loginForm', '/signupForm'];

export default function TabLayout() {
  
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);
  const isExcluded = EXCLUDED_ROUTES.includes(pathname);

  const startInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isExcluded) {
      timerRef.current = setTimeout(() => {
        setShowLogoutModal(true);
      }, SESSION_TIMEOUT);
    }
  };
  const resetTimer = () => {
    if (showLogoutModal || isExcluded) return;
    startInactivityTimer();
  };

  useEffect(() => {
    if (isExcluded) return;
    startInactivityTimer();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        resetTimer();
      }
      appState.current = nextAppState;
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      subscription.remove();
    };
  }, [isExcluded, showLogoutModal]);
  useEffect(() => {
    if (!isExcluded && !showLogoutModal) {
      startInactivityTimer();
    }
  }, [pathname, isExcluded, showLogoutModal]);

  const handleUserActivity = () => {
    resetTimer();
    Keyboard.dismiss();
  };

  const handleLogout = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowLogoutModal(false);
    router.replace('/');
  };

  if (!pathname) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={handleUserActivity}>
        <View style={{ flex: 1 }}>
        {showLogoutModal && !isExcluded && (
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Text style={styles.title}>Session Expired</Text>
              <Text style={styles.message}>You've been logged out due to inactivity.</Text>
              <Pressable
                style={styles.button}
                onPress={handleLogout}
              >
                <Text style={styles.buttonText}>OK</Text>
              </Pressable>
            </View>
          </View>
        )}

        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen name="index" />
        </Tabs>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

