import { router } from 'expo-router';
import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, PixelRatio, Platform, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
    <ThemedView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/RigorLogo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      <ThemedText style={styles.welcomeText} type="title">Welcome</ThemedText>
      <ThemedText style={styles.subtitleText}>Have a better trucking experience</ThemedText>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.createAccountButton}
          onPress={() => router.push('/signupForm')}
        >
          <ThemedText style={styles.createAccountButtonText}>Create an account</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/loginForm')}
        >
          <ThemedText style={styles.loginButtonText}>Log in</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 390;
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.3;

const getScale = () => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
};

const normalize = (size:any) => {
  const scale = getScale();
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: Math.min(SCREEN_WIDTH * 0.05, 24),
    paddingTop: Platform.OS === 'ios' ? 0 : Math.min(SCREEN_HEIGHT * 0.02, 16),
    paddingBottom: Math.min(SCREEN_HEIGHT * 0.02, 16),
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Math.min(SCREEN_HEIGHT * 0.1, 100),
    marginBottom: Math.min(SCREEN_HEIGHT * 0.04, 32),
  },
  logo: {
    width: Math.min(SCREEN_WIDTH * 0.85, 400),
    height: Math.min(SCREEN_HEIGHT * 0.25, 200),
    maxWidth: '85%',
  },
  welcomeText: {
    fontSize: normalize(24),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: Math.min(SCREEN_HEIGHT * 0.05, 20),
    marginBottom: Math.min(SCREEN_HEIGHT * 0.01, 8),
    color: '#202545',
  },
  subtitleText: {
    fontSize: normalize(16),
    color: '#7F9FB4',
    textAlign: 'center',
    marginBottom: Math.min(SCREEN_HEIGHT * 0.04, 32),
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    display:'flex',
    justifyContent: 'center',
    gap: Math.min(SCREEN_HEIGHT * 0.015, 15),
    marginTop: Math.min(SCREEN_HEIGHT * 0.4, 200),
  },
  createAccountButton: {
    backgroundColor: '#202545',
    padding: Math.min(SCREEN_HEIGHT * 0.02, 16),
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    minHeight: 48,
    display:'flex',
    justifyContent: 'center',
  },
  createAccountButtonText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#fff',
    padding: Math.min(SCREEN_HEIGHT * 0.02, 16),
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a237e',
    width: '100%',
    marginTop: Math.min(SCREEN_HEIGHT * 0.04, 20),
    marginBottom: Math.min(SCREEN_HEIGHT * 0.2, 70),
    minHeight: 48,
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#202545',
    fontSize: normalize(16),
    fontWeight: '600',
  },
});