import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, PixelRatio, Platform, SafeAreaView, ScrollView, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function WelcomeScreen() {
  const truckPosition = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    const moveAnimation = Animated.loop(
      Animated.sequence([
        // Move right
        Animated.timing(truckPosition, {
          toValue: SCREEN_WIDTH - 100,
          duration: 4000,
          useNativeDriver: true,
        }),
        // Reset position
        Animated.timing(truckPosition, {
          toValue: -150,
          duration: 0,
          useNativeDriver: true,
        })
      ])
    );

    moveAnimation.start();
    return () => moveAnimation.stop();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.scrollContainer}>
    <ThemedView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/rigor_no_bg.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      <ThemedText style={styles.welcomeText} type="title">Welcome</ThemedText>
      <ThemedText style={styles.subtitleText}>Where Every Mile Matters</ThemedText>

      <View style={styles.animationContainer}>
        <Image
          source={require('../../assets/images/line_rm.png')}
          style={styles.roadLine}
          resizeMode="stretch"
        />
        <Animated.View style={[styles.truckContainer, { transform: [{ translateX: truckPosition }] }]}>
          <Image
            source={require('../../assets/images/truck_only_rm.png')}
            style={styles.truckImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

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
    </ScrollView>
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
  animationContainer: {
    position: 'relative',
    height: 150,
    marginTop: Math.min(SCREEN_HEIGHT * 0.03, 24),
    marginBottom: Math.min(SCREEN_HEIGHT * 0.03, 24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadLine: {
    width: '100%',
    height: 20,
    position: 'absolute',
    bottom: 25,
  },
  truckContainer: {
    position: 'absolute',
    bottom: 25,
    zIndex: 1,
  },
  truckImage: {
    width: 120,
    height: 72,
  },
  safeArea: {
    flex: 1,
    
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Math.min(SCREEN_WIDTH * 0.05, 24),
    paddingTop: Platform.OS === 'ios' ? 0 : Math.min(SCREEN_HEIGHT * 0.02, 16),
    paddingBottom: Math.min(SCREEN_HEIGHT * 0.02, 16),
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Math.min(SCREEN_HEIGHT * 0.08, 80),
    marginBottom: Math.min(SCREEN_HEIGHT * 0.05, 40),
  },
  logo: {
    width: Math.min(SCREEN_WIDTH * 0.9, 420),
    height: Math.min(SCREEN_HEIGHT * 0.28, 220),
    maxWidth: '90%',
  },
  welcomeText: {
    fontSize: normalize(32),
    fontWeight: '700',
    textAlign: 'center',
    marginTop: Math.min(SCREEN_HEIGHT * 0.05, 20),
    marginBottom: Math.min(SCREEN_HEIGHT * 0.02, 12),
    color: '#071952',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitleText: {
    fontSize: normalize(18),
    color: '#088395',
    textAlign: 'center',
    marginBottom: Math.min(SCREEN_HEIGHT * 0.04, 32),
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    display:'flex',
    justifyContent: 'center',
    gap: Math.min(SCREEN_HEIGHT * 0.02, 20),
    marginTop: Math.min(SCREEN_HEIGHT * 0.05, 40),
  },
  createAccountButton: {
    backgroundColor: '#071952',
    padding: Math.min(SCREEN_HEIGHT * 0.022, 18),
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    minHeight: 52,
    display:'flex',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 4,
  },
  createAccountButtonText: {
    color: '#EBF4F6',
    fontSize: normalize(18),
    fontWeight: '700',
  },
  loginButton: {
    backgroundColor: '#088395',
    padding: Math.min(SCREEN_HEIGHT * 0.022, 18),
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: Math.min(SCREEN_HEIGHT * 0.02, 15),
    marginBottom: Math.min(SCREEN_HEIGHT * 0.15, 60),
    minHeight: 52,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 4,
  },
  loginButtonText: {
    color: '#EBF4F6',
    fontSize: normalize(18),
    fontWeight: '700',
  },
});