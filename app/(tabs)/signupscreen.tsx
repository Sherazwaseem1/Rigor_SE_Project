import { router } from 'expo-router';
import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function SignupScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/truck-illustration.svg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      <ThemedText style={styles.welcomeText} type="title">Join Rigor</ThemedText>
      <ThemedText style={styles.subtitleText}>Have a better trucking experience</ThemedText>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.gmailButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Image
            source={require('../../assets/images/gmail-logo.svg')}
            style={styles.gmailLogo}
            resizeMode="contain"
          />
          <ThemedText style={styles.gmailButtonText}>Sign up with Gmail</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signInLink}
          onPress={() => router.push('/(tabs)')}
        >
          <ThemedText style={styles.signInText}>Already have an account? Sign in</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 380,
    height: 250,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
    marginTop: 150,
    alignItems: 'center',
  },
  gmailButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  gmailLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  gmailButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  signInLink: {
    padding: 10,
  },
  signInText: {
    color: '#1a237e',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});