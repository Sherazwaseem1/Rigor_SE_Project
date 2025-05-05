import { Tabs, usePathname, useRouter } from 'expo-router';
import {
  AppState,
  AppStateStatus,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
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
  const lastActivity = useRef(Date.now());

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        resetTimer();
        return false;
      },
      onMoveShouldSetPanResponder: () => false,
    })
  ).current;

  const startInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isExcluded) {
      timerRef.current = setTimeout(() => {

        if (Date.now() - lastActivity.current >= SESSION_TIMEOUT) {
          setShowLogoutModal(true);
        } else {

          startInactivityTimer();
        }
      }, SESSION_TIMEOUT);
    }
  };
  
  const resetTimer = () => {
    if (showLogoutModal || isExcluded) return;
    lastActivity.current = Date.now();
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

  const handleLogout = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowLogoutModal(false);
    router.replace('/');
  };

  if (!pathname) return null;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {showLogoutModal && !isExcluded && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Session Expired</Text>
            <Text style={styles.message}>You've been logged out due to inactivity.</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
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
  );
}

