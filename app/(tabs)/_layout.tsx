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

  // Create activity handler using PanResponder
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
        // Only show logout modal if the user has been inactive
        if (Date.now() - lastActivity.current >= SESSION_TIMEOUT) {
          setShowLogoutModal(true);
        } else {
          // User was active, restart timer
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
  
  // Reset timer when the route changes
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

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modal: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});