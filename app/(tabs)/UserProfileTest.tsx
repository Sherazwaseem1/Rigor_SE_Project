import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import { Link } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';

const UserProfileTest = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="../" style={styles.backButton}>
          <View style={styles.backButtonContent}>
            <IconSymbol size={24} name="chevron.left" color="#333" />
            <ThemedText style={styles.backButtonLabel}>Back</ThemedText>
          </View>
        </Link>
      </View>

      <View style={styles.profileSection}>
        <Image
          source={require('../../assets/images/bashira_no_bg.png')}
          style={styles.profileImage}
        />
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoField}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>Muhammad Bashir</Text>
        </View>

        <View style={styles.infoField}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>bashiray2003@gmail.com</Text>
        </View>

        <View style={styles.infoField}>
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.value}>+92 333 4916424</Text>
        </View>

        <View style={styles.infoField}>
          <Text style={styles.label}>Rating</Text>
          <View style={styles.ratingContainer}>
            {'★★★★☆'.split('').map((star, index) => (
              <Text
                key={index}
                style={[styles.star, { color: index < 4 ? '#FFD700' : '#D3D3D3' }]}
              >
                {star}
              </Text>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.ridesButton}>
          <Text style={styles.ridesButtonText}>Rides</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Math.max(screenHeight * 0.05, 40),
  },
  header: {
    paddingHorizontal: Math.max(screenWidth * 0.04, 16),
    marginBottom: Math.max(screenHeight * 0.02, 16),
  },
  backButton: {
    paddingVertical: Math.max(screenHeight * 0.01, 8),
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonLabel: {
    fontSize: Math.min(Math.max(screenWidth * 0.04, 16), 18),
    color: '#333',
    marginBottom: screenHeight * 0.004,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: Math.max(screenHeight * 0.03, 24),
    paddingHorizontal: Math.max(screenWidth * 0.04, 16),
  },
  profileImage: {
    width: Math.min(Math.max(screenWidth * 0.35, 140), 180),
    height: Math.min(Math.max(screenWidth * 0.35, 140), 180),
    borderRadius: Math.min(Math.max(screenWidth * 0.175, 70), 90),
    backgroundColor: '#E8E8E8',
  },
  infoSection: {
    paddingHorizontal: Math.max(screenWidth * 0.04, 16),
    paddingTop: Math.max(screenHeight * 0.01, 8),
  },
  infoField: {
    marginBottom: Math.max(screenHeight * 0.02, 16),
    backgroundColor: '#F8F9FA',
    padding: Math.max(screenWidth * 0.03, 12),
    borderRadius: Math.min(Math.max(screenWidth * 0.02, 8), 12),
  },
  label: {
    fontSize: Math.min(Math.max(screenWidth * 0.035, 14), 15),
    color: '#202545',
    marginBottom: Math.max(screenHeight * 0.008, 6),
    fontWeight: '700',
  },
  value: {
    fontSize: Math.min(Math.max(screenWidth * 0.038, 15), 17),
    color: '#000',
    fontWeight: '400',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Math.max(screenHeight * 0.004, 4),
  },
  star: {
    fontSize: Math.min(Math.max(screenWidth * 0.05, 20), 24),
    marginRight: Math.max(screenWidth * 0.008, 4),
  },
  ridesButton: {
    backgroundColor: '#7F9FB4',
    paddingVertical: Math.max(screenHeight * 0.015, 12),
    borderRadius: Math.min(Math.max(screenWidth * 0.02, 8), 12),
    alignItems: 'center',
    marginTop: Math.max(screenHeight * 0.03, 24),
    marginHorizontal: Math.max(screenWidth * 0.015, 8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ridesButtonText: {
    color: '#202545',
    fontSize: Math.min(Math.max(screenWidth * 0.04, 16), 18),
    fontWeight: '700',
  },
});

export default UserProfileTest;