import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { RootState } from '@/redux/store'; // Adjust path based on your Redux setup
import { getAdminById, getTruckerById, Trucker, Admin } from '../../services/api'; // Adjust path based on your API setup
import { useRouter } from 'expo-router';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import { StarRatingDisplay } from 'react-native-star-rating-widget';

const UserProfileTest = () => {
  const { isAdmin, id } = useSelector((state: RootState) => state.user);
  const [userData, setUserData] = useState<Admin | Trucker | null>(null);
  const [ratingData, setRatingData] = useState<number | null>(null); // Add state for rating
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = isAdmin 
          ? await getAdminById(id) 
          : await getTruckerById(id);
        setUserData(data);

        // Set rating data if it's a Trucker
        if (!isAdmin && data && 'rating' in data) {
          setRatingData((data as Trucker).rating);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [isAdmin, id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7F9FB4" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load user data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (isAdmin) {
              router.push('/AdminDashboard');
            } else {
              router.push('/TruckerDashboard');
            }
          }}
        >
          <View style={styles.backButtonContent}>
            <IconSymbol size={24} name="chevron.left" color="#333" />
            <ThemedText style={styles.backButtonLabel}>Back</ThemedText>
          </View>
        </TouchableOpacity>
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
          <Text style={styles.value}>{userData.name}</Text>
        </View>

        <View style={styles.infoField}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userData.email}</Text>
        </View>

        <View style={styles.infoField}>
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.value}>{userData.phone_number || 'N/A'}</Text>
        </View>

        {/* Render the rating only if user is a Trucker */}
        {!isAdmin && ratingData !== null && (
          <View style={styles.infoField}>
              <StarRatingDisplay rating={ratingData} />
          </View>

          
        )}

        {!isAdmin && (
          <TouchableOpacity style={styles.ridesButton}>
            <Text style={styles.ridesButtonText}>Rides</Text>
          </TouchableOpacity>
        )}
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
  starContainer: {
    position: 'relative',
    height: 24, // Adjust based on your star size
    width: 24,  // Adjust based on your star size
    justifyContent: 'center',
    alignItems: 'center',
  },
  partialStarOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    overflow: 'hidden',
  },
  star: {
    fontSize: Math.min(Math.max(screenWidth * 0.05, 20), 24),
    marginRight: Math.max(screenWidth * 0.008, 4),
  },
  filledStarClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    overflow: 'hidden',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});

export default UserProfileTest;
