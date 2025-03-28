import { router } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SvgUri } from 'react-native-svg';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function SignupScreen() {
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <View style={styles.backButtonContent}>
          <IconSymbol size={24} name="chevron.left" color="#333" />
          <ThemedText style={styles.backButtonLabel}>Back</ThemedText>
        </View>
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/truck.png')}
        />
      <ThemedText style={styles.subtitleText}>Have a better trucking experience</ThemedText>
      </View>
      
      {/* <ThemedText style={styles.welcomeText} type="title">Join Rigor</ThemedText> */}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.gmailButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Image
            source={require('../../assets/images/search.png')}
            style={styles.gmailLogo}
          />
          <ThemedText style={styles.gmailButtonText}>Sign up with Google</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signInLink}
          onPress={() => router.push('/(tabs)')}
        >
          <View style={styles.signInTextContainer}>
            <ThemedText style={styles.signInQuestion}>Already have an account?</ThemedText>
            <ThemedText style={styles.signInText}> Sign in</ThemedText>
          </View>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: screenHeight * 0.05,
  },
  backButton: {
    position: 'absolute',
    top: Math.max(screenHeight * 0.05, 20),
    left: screenWidth * 0.05,
    zIndex: 1,
    padding: Math.min(screenWidth * 0.025, 15),
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: Math.min(screenWidth * 0.045, 20),
    color: '#333',
    marginRight: screenWidth * 0.01,
  },
  backButtonLabel: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    color: '#333',
    marginBottom: screenHeight * 0.004,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Math.min(screenHeight * 0.15, 120),
    marginBottom: screenHeight * 0.2,
  },
  logo: {
    width: Math.min(screenWidth * 0.8, 300),
    height: Math.min(screenWidth * 0.8 * 0.6, 180),
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: Math.min(screenWidth * 0.06, 24),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: screenHeight * 0.01,
    color: '#333',
  },
  subtitleText: {
    fontSize: Math.min(screenWidth * 0.04, 16),
    color: '#7F9FB4',
    textAlign: 'center',
    marginBottom: screenHeight * 0.03,
  },
  buttonContainer: {
    width: '100%',
    gap: Math.min(screenHeight * 0.02, 15),
    marginTop: 'auto',
    marginBottom: screenHeight * 0.1,
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.05,
  },
  gmailButton: {
    backgroundColor: '#fff',
    padding: Math.min(screenWidth * 0.04, 16),
    borderRadius: Math.min(screenWidth * 0.02, 8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 48,
  },
  gmailLogo: {
    width: Math.min(screenWidth * 0.06, 24),
    height: Math.min(screenWidth * 0.06, 24),
    marginRight: screenWidth * 0.025,
  },
  gmailButtonText: {
    color: '#202545',
    fontSize: Math.min(screenWidth * 0.04, 16),
    fontWeight: '500',
  },
  signInLink: {
    padding: Math.min(screenWidth * 0.025, 12),
    minHeight: 44,
    justifyContent: 'center',
  },
  signInTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInQuestion: {
    color: '#202545',
    fontSize: Math.min(screenWidth * 0.035, 14),
  },
  signInText: {
    color: '#7F9FB4',
    fontSize: Math.min(screenWidth * 0.035, 14),
    textDecorationLine: 'underline',
  },
  signInLink: {
    padding: Math.min(screenWidth * 0.025, 12),
    minHeight: 44,
    justifyContent: 'center',
  },
});