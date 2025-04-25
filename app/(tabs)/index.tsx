import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, PixelRatio, Platform, SafeAreaView, ScrollView, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from '../../assets/styles/styleIndex';


export default function WelcomeScreen() {
  const truckPosition = useRef(new Animated.Value(-150)).current;
  const truckRotation = useRef(new Animated.Value(0)).current;
  const truckScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const moveAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(truckPosition, {
            toValue: SCREEN_WIDTH - 235,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(truckRotation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(truckScale, {
              toValue: 1.1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(truckScale, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            })
          ])
        ]),
        Animated.parallel([
          Animated.timing(truckPosition, {
            toValue: -150,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(truckRotation, {
            toValue: 180,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(truckScale, {
              toValue: 1.1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(truckScale, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            })
          ])
        ])
      ])
    );

    moveAnimation.start();
    return () => moveAnimation.stop();
  }, []);


  return (
    <SafeAreaView style={styles.safeArea}>
    <ThemedView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/rigor_no_bg.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      <Animated.View style={{ opacity: textOpacity }}>
        <ThemedText style={styles.welcomeText} type="title">Welcome</ThemedText>
        <ThemedText style={styles.subtitleText}>Where Every Mile Matters</ThemedText>
      </Animated.View>

      <Animated.View style={[styles.truckContainer, { transform: [{ translateX: truckPosition }, { rotateY: truckRotation.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] }) }, { scale: truckScale }] }]}>
        <Image
          source={require('../../assets/images/truck_only_rm.png')}
          style={styles.truckImage}
          resizeMode="contain"
        />
      </Animated.View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.createAccountButton}
          onPress={() => {
            Animated.sequence([
              Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true
              }),
              Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true
              })
            ]).start(() => router.push('/signupForm'));
          }}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <ThemedText style={styles.createAccountButtonText}>Create an account</ThemedText>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => {
            Animated.sequence([
              Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true
              }),
              Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true
              })
            ]).start(() => router.push('/loginForm'));
          }}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <ThemedText style={styles.loginButtonText}>Log in</ThemedText>
          </Animated.View>
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