import React, { useEffect, useState } from 'react';
import styles from '../../assets/styles/styleUserProfile';
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
} from '../../services/api';

import   {Trucker,Admin} from '../../services/util';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dx7hrymxn/image/upload';
const UPLOAD_PRESET = 'Rigor-code';
const { width, height } = Dimensions.get('window');

const userProfile = () => {
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
    });
    data.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      return json.secure_url || null;
    } catch (err) {
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

  if (!userData) return null; 

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push(isAdmin ? '/adminDashboard' : '/truckerDashboard')}
          >
            <IconSymbol name="chevron.left" size={24} color="#071952" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.imageWrapper}>
          {userData?.profile_pic_url ? (
              <Image
                source={{ uri: userData.profile_pic_url }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileIcon}>
                <Text style={styles.profileIconText}>
                  {userData?.name?.[0] || "?"}
                </Text>
              </View>
            )}
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


export default userProfile;
