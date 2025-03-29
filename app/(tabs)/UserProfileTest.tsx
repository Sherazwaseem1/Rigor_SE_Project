import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

const UserProfileTest = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="../" style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
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
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#E8E8E8',
  },
  infoSection: {
    paddingHorizontal: 20,
  },
  infoField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 20,
    marginRight: 2,
  },
  ridesButton: {
    backgroundColor: '#B0C4DE',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  ridesButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UserProfileTest;