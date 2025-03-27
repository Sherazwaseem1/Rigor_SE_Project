import { router } from 'expo-router';
import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function WelcomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/RigorLogo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      <ThemedText style={styles.welcomeText} type="title">Welcome</ThemedText>
      <ThemedText style={styles.subtitleText}>Have a better tutoring experience</ThemedText>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.createAccountButton}
          onPress={() => router.push('/(tabs)')}
        >
          <ThemedText style={styles.createAccountButtonText}>Create an account</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/(tabs)')}
        >
          <ThemedText style={styles.loginButtonText}>Log in</ThemedText>
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
    gap: 10,
    marginTop: 150,
  },
  createAccountButton: {
    backgroundColor: '#1a237e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createAccountButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a237e',
  },
  loginButtonText: {
    color: '#1a237e',
    fontSize: 16,
    fontWeight: '600',
  },
});