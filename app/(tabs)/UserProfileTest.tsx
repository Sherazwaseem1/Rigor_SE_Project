// Rewritten UserProfileTest.tsx styled like the dashboards (Admin & Trucker)
// Consistent layout, colors, typography, shadows, and spacing

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { RootState } from '@/redux/store';
import {
  getAdminById,
  getTruckerById,
  updateTruckerProfilePic,
  updateAdminProfileImage,
  Trucker,
  Admin
} from '../../services/api';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dx7hrymxn/image/upload';
const UPLOAD_PRESET = 'Rigor-code';
const { width, height } = Dimensions.get('window');

const UserProfileTest = () => {
  const { isAdmin, id } = useSelector((state: RootState) => state.user);
  const [userData, setUserData] = useState<Trucker | Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const isFocused = useIsFocused();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data: Trucker | Admin = isAdmin ? await getAdminById(id) : await getTruckerById(id);
        setUserData(data);
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [isFocused]);

  const uploadToCloudinary = async (uri: string) => {
    const data = new FormData();
    data.append('file', {
      uri,
      type: 'image/jpeg',
      name: `upload_${Date.now()}.jpg`,
    } as any);
    data.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      return json.secure_url || null;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      setUploading(true);
      const uploadedUrl = await uploadToCloudinary(uri);
      setUploading(false);

      if (uploadedUrl) {
        try {
          const updated = isAdmin
            ? await updateAdminProfileImage(id, uploadedUrl)
            : await updateTruckerProfilePic(id, uploadedUrl);
          setUserData(updated);
        } catch (err) {
          console.error('Update profile pic failed:', err);
        }
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#088395" />
      </View>
    );
  }

  if (!userData) return null; // ✅ Fixes the "possibly null" TS error

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push(isAdmin ? '/AdminDashboardNew' : '/TruckerDashboardNew')}
            style={styles.menuButton}
          >
            <IconSymbol name="chevron.left" size={24} color="#071952" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.imageWrapper}>
            <Image
              source={
                userData.profile_pic_url
                  ? { uri: userData.profile_pic_url }
                  : require('../../assets/images/prof.png')
              }
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.imageOverlayButton} onPress={handleImagePick}>
              <Text style={styles.imageOverlayText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{userData.name}</Text>
          <Text style={styles.roleLabel}>{isAdmin ? 'Administrator' : 'Trucker'}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoText}>{userData.email}</Text>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoText}>{userData.phone_number || 'N/A'}</Text>
          {'rating' in userData && userData.rating !== undefined && (
            <>
              <Text style={styles.infoLabel}>Rating</Text>
              <Text style={styles.infoText}>⭐ {userData.rating.toFixed(1)} / 5</Text>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#EBF4F6', paddingBottom: 32 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EBF4F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuButton: { padding: 8 },
  headerTitle: { marginLeft: 16, fontSize: 20, fontWeight: '600', color: '#071952' },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  imageWrapper: { position: 'relative' },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderColor: '#E2E8F0',
    borderWidth: 2,
  },
  imageOverlayButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#088395',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlayText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  profileName: { fontSize: 18, fontWeight: '600', color: '#071952', marginTop: 12 },
  roleLabel: { fontSize: 14, color: '#37B7C3', fontWeight: '500', marginTop: 4 },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 16,
  },
  infoLabel: { fontSize: 13, color: '#64748B', marginBottom: 4, fontWeight: '500' },
  infoText: { fontSize: 15, color: '#071952', marginBottom: 12, fontWeight: '600' },
});

export default UserProfileTest;
